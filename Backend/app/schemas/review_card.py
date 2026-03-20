from datetime import datetime
from pydantic import BaseModel


class ReviewCardBase(BaseModel):
    question_id: int
    notes: str | None = None


class ReviewCardCreate(ReviewCardBase):
    pass


class ReviewCardRead(ReviewCardBase):
    id: int
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review_at: datetime
    last_reviewed_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewCardWithQuestion(ReviewCardRead):
    question_text: str
    question_type: str
    difficulty: str
    topic: str


class ReviewRequest(BaseModel):
    quality: int  # 1=Again, 2=Hard, 3=Good, 4=Easy


class ReviewStats(BaseModel):
    total_cards: int
    due_today: int
    reviewed_today: int
