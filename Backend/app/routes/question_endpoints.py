from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.dependencies import get_db
from app.schemas.question import QuestionCreate, QuestionRead
from app.services.questions.question_logic import (
    create_question,
    create_questions_bulk,
    get_question,
    get_all_questions,
    get_questions_by_bank,
    update_question,
    delete_question,
)

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/", response_model=QuestionRead, status_code=201)
def create(data: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, data)


@router.post("/bulk", response_model=list[QuestionRead], status_code=201)
def create_bulk(data: list[QuestionCreate], db: Session = Depends(get_db)):
    return create_questions_bulk(db, data)


@router.get("/", response_model=list[QuestionRead])
def list_questions(db: Session = Depends(get_db)):
    return get_all_questions(db)


@router.get("/bank/{bank_id}", response_model=list[QuestionRead])
def list_by_bank(bank_id: int, db: Session = Depends(get_db)):
    return get_questions_by_bank(db, bank_id)


@router.get("/{question_id}", response_model=QuestionRead)
def read_question(question_id: int, db: Session = Depends(get_db)):
    question = get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/{question_id}", response_model=QuestionRead)
def update(question_id: int, data: QuestionCreate, db: Session = Depends(get_db)):
    question = update_question(db, question_id, data)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.delete("/{question_id}", status_code=204)
def delete(question_id: int, db: Session = Depends(get_db)):
    deleted = delete_question(db, question_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Question not found")
