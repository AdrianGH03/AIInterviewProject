"""WebSocket endpoint for real-time interview sessions."""

import json
import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models import InterviewSession, Question, Response as ResponseModel
from app.services.ai.ollama_service import chat_with_ollama, generate_feedback

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Interview WebSocket"])


@router.websocket("/ws/interview/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: int):
    """WebSocket endpoint for conducting a live interview session.

    Protocol (JSON messages):
      Client -> Server:
        {"type": "message", "content": "user's answer text"}
        {"type": "end_session"}

      Server -> Client:
        {"type": "ai_message", "content": "AI interviewer text"}
        {"type": "feedback", "content": "detailed feedback text"}
        {"type": "session_ended"}
        {"type": "error", "detail": "error description"}
    """
    await websocket.accept()

    db: Session = next(get_db())

    try:
        session = (
            db.query(InterviewSession)
            .filter(InterviewSession.id == session_id)
            .first()
        )
        if not session:
            await websocket.send_json(
                {"type": "error", "detail": "Session not found"}
            )
            await websocket.close()
            return

        # Load question bank questions if the session has one
        bank_questions: list[Question] = []
        bank_question_index = 0
        if session.question_bank_id:
            bank_questions = (
                db.query(Question)
                .filter(Question.questionbank_id == session.question_bank_id)
                .order_by(Question.id)
                .all()
            )

        # Conversation history for Ollama context
        conversation: list[dict[str, str]] = []
        response_order = 0
        all_questions_answered = False

        # Generate opening question
        if bank_questions:
            # Use the first question from the bank
            q = bank_questions[bank_question_index]
            bank_question_index += 1
            opening_msg = (
                f"You are conducting a {session.type} interview on {session.topic}. "
                f"Ask the candidate the following question exactly as written, "
                f"then wait for their answer:\n\n{q.question_text}"
            )
        else:
            opening_msg = (
                f"Start this {session.type} interview on {session.topic}. "
                f"Ask the first {session.difficulty}-level question. "
                f"Only output the question, nothing else."
            )

        conversation.append({"role": "user", "content": opening_msg})

        ai_reply = await chat_with_ollama(
            conversation,
            interview_type=session.type,
            topic=session.topic,
            difficulty=session.difficulty,
        )
        conversation.append({"role": "assistant", "content": ai_reply})

        # Store the AI's opening question as a response record
        ai_response = ResponseModel(
            type_of_response="ai_question",
            interview_session_id=session_id,
            response_text=ai_reply,
            response_order=response_order,
        )
        db.add(ai_response)
        db.commit()
        response_order += 1

        await websocket.send_json({"type": "ai_message", "content": ai_reply})

        # Main conversation loop
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "detail": "Invalid JSON"}
                )
                continue

            msg_type = data.get("type", "")

            if msg_type == "end_session":
                # Generate final feedback
                if conversation:
                    full_text = "\n".join(
                        f"{m['role']}: {m['content']}" for m in conversation
                    )
                    feedback_text = await generate_feedback(
                        question_text="Full interview session",
                        answer_text=full_text,
                        interview_type=session.type,
                        topic=session.topic,
                    )
                    await websocket.send_json(
                        {"type": "feedback", "content": feedback_text}
                    )

                from datetime import datetime, timezone

                session.is_completed = True
                session.time_ended = datetime.now(timezone.utc)
                db.commit()

                await websocket.send_json({"type": "session_ended"})
                await websocket.close()
                break

            elif msg_type == "message":
                user_content = data.get("content", "").strip()
                if not user_content:
                    continue

                # Store user's answer
                user_response = ResponseModel(
                    type_of_response="answer",
                    interview_session_id=session_id,
                    response_text=user_content,
                    response_order=response_order,
                )
                db.add(user_response)
                db.commit()
                response_order += 1

                # Build the user message — for bank-based interviews, combine
                # the candidate's answer with evaluation instructions in a
                # single user turn so the conversation stays in clean
                # user/assistant alternation (avoids mid-conversation system
                # messages that many Ollama models mishandle).
                if bank_questions and bank_question_index < len(bank_questions):
                    q = bank_questions[bank_question_index]
                    bank_question_index += 1
                    combined_content = (
                        f"{user_content}\n\n"
                        f"[INTERVIEWER INSTRUCTION — not visible to the candidate]\n"
                        f"The candidate's answer is everything before this instruction block. "
                        f"Carefully evaluate whether their answer is correct or partially correct "
                        f"before concluding it is wrong. Give credit for answers that demonstrate "
                        f"understanding even if the wording is imprecise. "
                        f"Only mark an answer as incorrect if it is clearly, factually wrong.\n\n"
                        f"1. Briefly evaluate their answer (what was correct, what was missed).\n"
                        f"2. Then ask this next question exactly as written:\n\n{q.question_text}"
                    )
                    conversation.append({"role": "user", "content": combined_content})
                elif bank_questions and bank_question_index >= len(bank_questions):
                    # All bank questions have been asked — wrap up
                    all_questions_answered = True
                    combined_content = (
                        f"{user_content}\n\n"
                        f"[INTERVIEWER INSTRUCTION — not visible to the candidate]\n"
                        f"The candidate's answer is everything before this instruction block. "
                        f"Carefully evaluate whether their answer is correct or partially correct "
                        f"before concluding it is wrong. Give credit for answers that demonstrate "
                        f"understanding even if the wording is imprecise.\n\n"
                        f"The candidate has answered all {len(bank_questions)} questions "
                        f"from the question bank. Evaluate their last answer, "
                        f"then let them know the interview is complete."
                    )
                    conversation.append({"role": "user", "content": combined_content})
                else:
                    conversation.append({"role": "user", "content": user_content})

                ai_reply = await chat_with_ollama(
                    conversation,
                    interview_type=session.type,
                    topic=session.topic,
                    difficulty=session.difficulty,
                )
                conversation.append({"role": "assistant", "content": ai_reply})

                # Store AI response
                ai_resp = ResponseModel(
                    type_of_response="ai_question",
                    interview_session_id=session_id,
                    response_text=ai_reply,
                    response_order=response_order,
                )
                db.add(ai_resp)
                db.commit()
                response_order += 1

                await websocket.send_json(
                    {"type": "ai_message", "content": ai_reply}
                )

                # Auto-end session after the user answered the last question and AI wrapped up
                if all_questions_answered:
                    # Generate final feedback
                    full_text = "\n".join(
                        f"{m['role']}: {m['content']}" for m in conversation
                    )
                    feedback_text = await generate_feedback(
                        question_text="Full interview session",
                        answer_text=full_text,
                        interview_type=session.type,
                        topic=session.topic,
                    )
                    await websocket.send_json(
                        {"type": "feedback", "content": feedback_text}
                    )

                    from datetime import datetime, timezone

                    session.is_completed = True
                    session.time_ended = datetime.now(timezone.utc)
                    db.commit()

                    await websocket.send_json({"type": "session_ended"})
                    await websocket.close()
                    break

    except WebSocketDisconnect:
        logger.info("Client disconnected from session %s", session_id)
    except Exception as e:
        logger.exception("WebSocket error in session %s", session_id)
        try:
            await websocket.send_json({"type": "error", "detail": str(e)})
        except Exception:
            pass
    finally:
        db.close()
