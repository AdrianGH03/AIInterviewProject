from datetime import datetime
from pydantic import BaseModel


class FeedbackBase(BaseModel):
    feedback_text: str
    interview_session_id: int
    question_id: int | None = None
    response_id: int | None = None
    audio_feedback: str | None = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackRead(FeedbackBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}