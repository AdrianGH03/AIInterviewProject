from sqlalchemy.orm import Session

from app.models import Interviewee
from app.schemas.interviewee import IntervieweeCreate

#create the interviewee and add the users row to the intervieww table
def create_interviewee(db: Session, data: IntervieweeCreate) -> Interviewee:
    interviewee = Interviewee(name=data.name)
    db.add(interviewee)
    db.commit()
    db.refresh(interviewee)
    return interviewee

#get the interviewee by getting their id and first one to show up when filtered by their id.
def get_interviewee(db: Session, interviewee_id: int) -> Interviewee | None:
    return db.query(Interviewee).filter(Interviewee.id == interviewee_id).first()

#gets all interviewees
def get_all_interviewees(db: Session) -> list[Interviewee]:
    return db.query(Interviewee).all()

#updates the interviewee if any updates made to it, if not, just return the interviewee as is.
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

#delete interviewee, pretty straight-forward.
def delete_interviewee(db: Session, interviewee_id: int) -> bool:
    interviewee = get_interviewee(db, interviewee_id)
    if not interviewee:
        return False
    db.delete(interviewee)
    db.commit()
    return True
