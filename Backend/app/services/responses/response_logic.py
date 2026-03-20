from sqlalchemy.orm import Session

from app.models import Response
from app.schemas.response import ResponseCreate


def create_response(db: Session, data: ResponseCreate) -> Response:
    response = Response(
        type_of_response=data.type_of_response,
        question_id=data.question_id,
        feedback_id=data.feedback_id,
        interview_session_id=data.interview_session_id,
        response_text=data.response_text,
        audio_response=data.audio_response,
        response_order=data.response_order,
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response


def get_response(db: Session, response_id: int) -> Response | None:
    return db.query(Response).filter(Response.id == response_id).first()


def get_responses_by_session(db: Session, session_id: int) -> list[Response]:
    return (
        db.query(Response)
        .filter(Response.interview_session_id == session_id)
        .order_by(Response.response_order)
        .all()
    )


def delete_response(db: Session, response_id: int) -> bool:
    response = get_response(db, response_id)
    if not response:
        return False
    db.delete(response)
    db.commit()
    return True
