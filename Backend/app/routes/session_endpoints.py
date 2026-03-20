from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.interview_session import InterviewSessionCreate, InterviewSessionRead
from app.services.sessions.interview_session_logic import (
    complete_interview_session,
    create_interview_session,
    delete_interview_session,
    get_all_interview_sessions,
    get_in_progress_sessions,
    get_interview_session,
    update_interview_session,
)

router = APIRouter(prefix="/sessions", tags=["Interview Sessions"])


@router.post("/", response_model=InterviewSessionRead, status_code=201)
def create_session(data: InterviewSessionCreate, db: Session = Depends(get_db)):
    return create_interview_session(db, data)


@router.get("/", response_model=list[InterviewSessionRead])
def list_sessions(db: Session = Depends(get_db)):
    return get_all_interview_sessions(db)


@router.get("/in-progress", response_model=list[InterviewSessionRead])
def list_in_progress(db: Session = Depends(get_db)):
    return get_in_progress_sessions(db)


@router.get("/{session_id}", response_model=InterviewSessionRead)
def read_session(session_id: int, db: Session = Depends(get_db)):
    session = get_interview_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.put("/{session_id}", response_model=InterviewSessionRead)
def update_session(
    session_id: int, data: InterviewSessionCreate, db: Session = Depends(get_db)
):
    session = update_interview_session(db, session_id, data)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.patch("/{session_id}/complete", response_model=InterviewSessionRead)
def complete_session(session_id: int, db: Session = Depends(get_db)):
    session = complete_interview_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db)):
    deleted = delete_interview_session(db, session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interview session not found")
