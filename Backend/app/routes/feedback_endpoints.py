from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.services.responses.feedback_logic import (
    create_feedback,
    delete_feedback,
    get_feedback,
    get_feedback_by_session,
)

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/", response_model=FeedbackRead, status_code=201)
def create(data: FeedbackCreate, db: Session = Depends(get_db)):
    return create_feedback(db, data)


@router.get("/session/{session_id}", response_model=list[FeedbackRead])
def list_by_session(session_id: int, db: Session = Depends(get_db)):
    return get_feedback_by_session(db, session_id)


@router.get("/{feedback_id}", response_model=FeedbackRead)
def read(feedback_id: int, db: Session = Depends(get_db)):
    feedback = get_feedback(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.delete("/{feedback_id}", status_code=204)
def remove(feedback_id: int, db: Session = Depends(get_db)):
    deleted = delete_feedback(db, feedback_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Feedback not found")
