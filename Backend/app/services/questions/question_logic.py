#questions get created and placed into question banks by their questionbank_id.
#each question has an id, question_text, question_type (coding | behavioral | system_design),
#difficulty (easy | medium | hard), topic, optional time_limit, optional questionbank_id, and created_at.

#questions can be created, read from, updated, and deleted by calling the appropriate HTTP request with the question's id as a parameter.
from sqlalchemy.orm import Session
from app.models import Question
from app.schemas.question import QuestionCreate



def create_question(db: Session, data: QuestionCreate) -> Question:
    question = Question(
        question_text=data.question_text,
        question_type=data.question_type,
        difficulty=data.difficulty,
        topic=data.topic,
        time_limit=data.time_limit,
        questionbank_id=data.questionbank_id,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def get_question(db: Session, question_id: int) -> Question | None:
    return db.query(Question).filter(Question.id == question_id).first()


def get_all_questions(db: Session) -> list[Question]:
    return db.query(Question).all()


def get_questions_by_bank(db: Session, bank_id: int) -> list[Question]:
    return db.query(Question).filter(Question.questionbank_id == bank_id).all()


def update_question(db: Session, question_id: int, data: QuestionCreate) -> Question | None:
    question = get_question(db, question_id)
    if not question:
        return None
    question.question_text = data.question_text
    question.question_type = data.question_type
    question.difficulty = data.difficulty
    question.topic = data.topic
    question.time_limit = data.time_limit
    question.questionbank_id = data.questionbank_id
    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: int) -> bool:
    question = get_question(db, question_id)
    if not question:
        return False
    db.delete(question)
    db.commit()
    return True
