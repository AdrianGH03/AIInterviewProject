from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.interviewee import IntervieweeCreate, IntervieweeRead
from app.services.interviewees.interviewee_logic import (
    create_interviewee,
    delete_interviewee,
    get_all_interviewees,
    get_interviewee,
    update_interviewee,
)

router = APIRouter(prefix="/interviewees", tags=["Interviewees"])


@router.post("/", response_model=IntervieweeRead, status_code=201)
def create(data: IntervieweeCreate, db: Session = Depends(get_db)):
    return create_interviewee(db, data)


@router.get("/", response_model=list[IntervieweeRead])
def list_all(db: Session = Depends(get_db)):
    return get_all_interviewees(db)


@router.get("/{interviewee_id}", response_model=IntervieweeRead)
def read(interviewee_id: int, db: Session = Depends(get_db)):
    interviewee = get_interviewee(db, interviewee_id)
    if not interviewee:
        raise HTTPException(status_code=404, detail="Interviewee not found")
    return interviewee


@router.put("/{interviewee_id}", response_model=IntervieweeRead)
def update(
    interviewee_id: int, data: IntervieweeCreate, db: Session = Depends(get_db)
):
    interviewee = update_interviewee(db, interviewee_id, data)
    if not interviewee:
        raise HTTPException(status_code=404, detail="Interviewee not found")
    return interviewee


@router.delete("/{interviewee_id}", status_code=204)
def remove(interviewee_id: int, db: Session = Depends(get_db)):
    deleted = delete_interviewee(db, interviewee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interviewee not found")
