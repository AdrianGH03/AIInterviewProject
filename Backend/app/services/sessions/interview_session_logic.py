from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import InterviewSession
from app.schemas.interview_session import InterviewSessionCreate


def create_interview_session(db: Session, data: InterviewSessionCreate) -> InterviewSession:
    session = InterviewSession(
        type=data.type,
        topic=data.topic,
        difficulty=data.difficulty,
        is_completed=data.is_completed,
        question_bank_id=data.question_bank_id,
        timer_duration=data.timer_duration,
        time_started=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_interview_session(db: Session, session_id: int) -> InterviewSession | None:
    return db.query(InterviewSession).filter(InterviewSession.id == session_id).first()


def get_all_interview_sessions(db: Session) -> list[InterviewSession]:
    return db.query(InterviewSession).order_by(InterviewSession.created_at.desc()).all()


def complete_interview_session(db: Session, session_id: int) -> InterviewSession | None:
    session = get_interview_session(db, session_id)
    if not session:
        return None
    session.is_completed = True
    session.time_ended = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


def update_interview_session(
    db: Session, session_id: int, data: InterviewSessionCreate
) -> InterviewSession | None:
    session = get_interview_session(db, session_id)
    if not session:
        return None
    session.type = data.type
    session.topic = data.topic
    session.difficulty = data.difficulty
    session.is_completed = data.is_completed
    session.question_bank_id = data.question_bank_id
    session.timer_duration = data.timer_duration
    db.commit()
    db.refresh(session)
    return session


def get_in_progress_sessions(db: Session) -> list[InterviewSession]:
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.is_completed == False)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )


def delete_interview_session(db: Session, session_id: int) -> bool:
    session = get_interview_session(db, session_id)
    if not session:
        return False
    db.delete(session)
    db.commit()
    return True
