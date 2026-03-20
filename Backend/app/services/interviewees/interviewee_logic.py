from sqlalchemy.orm import Session

from app.models import Interviewee
from app.schemas.interviewee import IntervieweeCreate


def create_interviewee(db: Session, data: IntervieweeCreate) -> Interviewee:
    interviewee = Interviewee(name=data.name)
    db.add(interviewee)
    db.commit()
    db.refresh(interviewee)
    return interviewee


def get_interviewee(db: Session, interviewee_id: int) -> Interviewee | None:
    return db.query(Interviewee).filter(Interviewee.id == interviewee_id).first()


def get_all_interviewees(db: Session) -> list[Interviewee]:
    return db.query(Interviewee).all()


def update_interviewee(
    db: Session, interviewee_id: int, data: IntervieweeCreate
) -> Interviewee | None:
    interviewee = get_interviewee(db, interviewee_id)
    if not interviewee:
        return None
    interviewee.name = data.name
    db.commit()
    db.refresh(interviewee)
    return interviewee


def delete_interviewee(db: Session, interviewee_id: int) -> bool:
    interviewee = get_interviewee(db, interviewee_id)
    if not interviewee:
        return False
    db.delete(interviewee)
    db.commit()
    return True
