from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.review_card import (
    ReviewCardCreate,
    ReviewCardRead,
    ReviewCardWithQuestion,
    ReviewRequest,
    ReviewStats,
)
from app.services.reviews.review_logic import (
    create_review_card,
    delete_review_card,
    get_all_review_cards,
    get_due_cards,
    get_review_stats,
    review_card,
    update_review_card_notes,
)

router = APIRouter(prefix="/reviews", tags=["Spaced Repetition"])


def _enrich_card(card) -> ReviewCardWithQuestion:
    q = card.question
    return ReviewCardWithQuestion(
        id=card.id,
        question_id=card.question_id,
        notes=card.notes,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
        repetitions=card.repetitions,
        next_review_at=card.next_review_at,
        last_reviewed_at=card.last_reviewed_at,
        created_at=card.created_at,
        question_text=q.question_text,
        question_type=q.question_type,
        difficulty=q.difficulty,
        topic=q.topic,
    )


@router.post("/", response_model=ReviewCardRead, status_code=201)
def create(data: ReviewCardCreate, db: Session = Depends(get_db)):
    return create_review_card(db, data)


@router.get("/", response_model=list[ReviewCardWithQuestion])
def list_all(db: Session = Depends(get_db)):
    cards = get_all_review_cards(db)
    return [_enrich_card(c) for c in cards]


@router.get("/due", response_model=list[ReviewCardWithQuestion])
def list_due(db: Session = Depends(get_db)):
    cards = get_due_cards(db)
    return [_enrich_card(c) for c in cards]


@router.get("/stats", response_model=ReviewStats)
def stats(db: Session = Depends(get_db)):
    return get_review_stats(db)


@router.post("/{card_id}/review", response_model=ReviewCardRead)
def do_review(card_id: int, data: ReviewRequest, db: Session = Depends(get_db)):
    if data.quality not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Quality must be 1-4")
    card = review_card(db, card_id, data.quality)
    if not card:
        raise HTTPException(status_code=404, detail="Review card not found")
    return card


@router.patch("/{card_id}/notes", response_model=ReviewCardRead)
def update_notes(card_id: int, data: dict, db: Session = Depends(get_db)):
    notes = data.get("notes", "")
    card = update_review_card_notes(db, card_id, notes)
    if not card:
        raise HTTPException(status_code=404, detail="Review card not found")
    return card


@router.delete("/{card_id}", status_code=204)
def remove(card_id: int, db: Session = Depends(get_db)):
    deleted = delete_review_card(db, card_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review card not found")
