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

#Router object is crated using fastapi APIRouter method
#The base route for the app is / so prefix= declares an added path to that base / route. So in this case the API is located at localhost:8000/feedback
#tags is used to group routes so all routes here are under the feedback tag.
router = APIRouter(prefix="/feedback", tags=["Feedback"])



#Create() is part of FastAPI that creates new resources, here is it creating a need feedback response
# being passed FeedbackCreate (pass all base parameters) to data and getting a db session from dependencies.py's db session maker of get_db
# Depends() is exactly as it sounds, it depends on get_db here before initializing Session and eventually calling the router
# finally, the create method returns the logic of creating a feedback response, passing the db and data parameter
@router.post("/", response_model=FeedbackRead, status_code=201)
def create(data: FeedbackCreate, db: Session = Depends(get_db)):
    return create_feedback(db, data)

#Same as other projects {} is a dynamic parameter, meaning it can change with whatevers passed to it
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
