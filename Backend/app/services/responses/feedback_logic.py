from sqlalchemy.orm import Session

from app.models import Feedback
from app.schemas.feedback import FeedbackCreate


def create_feedback(db: Session, data: FeedbackCreate) -> Feedback:
    feedback = Feedback(
        feedback_text=data.feedback_text,
        interview_session_id=data.interview_session_id,
        question_id=data.question_id,
        response_id=data.response_id,
        audio_feedback=data.audio_feedback,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def get_feedback(db: Session, feedback_id: int) -> Feedback | None:
    return db.query(Feedback).filter(Feedback.id == feedback_id).first()


def get_feedback_by_session(db: Session, session_id: int) -> list[Feedback]:
    return (
        db.query(Feedback)
        .filter(Feedback.interview_session_id == session_id)
        .order_by(Feedback.created_at)
        .all()
    )


def get_feedback_by_question(db: Session, question_id: int) -> list[Feedback]:
    return (
        db.query(Feedback)
        .filter(Feedback.question_id == question_id)
        .order_by(Feedback.created_at)
        .all()
    )


def delete_feedback(db: Session, feedback_id: int) -> bool:
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        return False
    db.delete(feedback)
    db.commit()
    return True
