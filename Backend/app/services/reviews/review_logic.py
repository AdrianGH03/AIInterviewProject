from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models.review_card import ReviewCard
from app.schemas.review_card import ReviewCardCreate

#Same concepts as in interviewee_logic.py in services/interviewees
def create_review_card(db: Session, data: ReviewCardCreate) -> ReviewCard:
    existing = (
        db.query(ReviewCard)
        .filter(ReviewCard.question_id == data.question_id)
        .first()
    )
    if existing:
        return existing

    card = ReviewCard(
        question_id=data.question_id,
        notes=data.notes,
        next_review_at=datetime.now(timezone.utc),
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def get_review_card(db: Session, card_id: int) -> ReviewCard | None:
    return db.query(ReviewCard).filter(ReviewCard.id == card_id).first()


def get_all_review_cards(db: Session) -> list[ReviewCard]:
    return db.query(ReviewCard).order_by(ReviewCard.next_review_at).all()


def get_due_cards(db: Session) -> list[ReviewCard]:
    now = datetime.now(timezone.utc)
    return (
        db.query(ReviewCard)
        .filter(ReviewCard.next_review_at <= now)
        .order_by(ReviewCard.next_review_at)
        .all()
    )


def review_card(db: Session, card_id: int, quality: int) -> ReviewCard | None:
    card = get_review_card(db, card_id)
    if not card:
        return None

    #Quality is 1-5 where 5 is perfect recall and 1 is they dont know
    #SM2 algorithm is the same algo that Anki uses to space out flashcard reviews based on how well the user recalled the information. It adjusts the review intervals and ease factor based on the quality of recall.
    sm2_quality = {1: 1, 2: 2, 3: 4, 4: 5}.get(quality, 3)

    #Set the interval in which the user needs to review the card again based on quality of their recall.
    if sm2_quality < 3:
        card.repetitions = 0
        card.interval_days = 1
    else:
        if card.repetitions == 0:
            card.interval_days = 1
        elif card.repetitions == 1:
            card.interval_days = 6
        else:
            card.interval_days = max(
                1, round(card.interval_days * card.ease_factor)
            )
        card.repetitions += 1

    #Ease factor is used in SM2 algorithm to control hwo fast interval between review grows.
    #The following just sets the ease factor to a SM2 algo formula for updating ease factors.
    card.ease_factor = max(
        1.3,
        card.ease_factor
        + (0.1 - (5 - sm2_quality) * (0.08 + (5 - sm2_quality) * 0.02)),
    )

    #Card review time captured to accurately track when user last reviewed and when review time is due again.
    card.last_reviewed_at = datetime.now(timezone.utc)
    card.next_review_at = datetime.now(timezone.utc) + timedelta(
        days=card.interval_days
    )

    db.commit()
    db.refresh(card)
    return card


def delete_review_card(db: Session, card_id: int) -> bool:
    card = get_review_card(db, card_id)
    if not card:
        return False
    db.delete(card)
    db.commit()
    return True

#Gets the review stats of user based on last tiem reviewed and today's date
def get_review_stats(db: Session) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total = db.query(ReviewCard).count()
    due = db.query(ReviewCard).filter(ReviewCard.next_review_at <= now).count()
    reviewed_today = (
        db.query(ReviewCard)
        .filter(ReviewCard.last_reviewed_at >= today_start)
        .count()
    )

    return {
        "total_cards": total,
        "due_today": due,
        "reviewed_today": reviewed_today,
    }


def update_review_card_notes(
    db: Session, card_id: int, notes: str
) -> ReviewCard | None:
    card = get_review_card(db, card_id)
    if not card:
        return None
    card.notes = notes
    db.commit()
    db.refresh(card)
    return card
