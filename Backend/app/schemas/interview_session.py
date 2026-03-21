from datetime import datetime
from pydantic import BaseModel

#refer to feedback.py, same concepts.
class InterviewSessionBase(BaseModel):
    type: str
    topic: str
    difficulty: str
    is_completed: bool = False
    question_bank_id: int | None = None
    timer_duration: int = 0


class InterviewSessionCreate(InterviewSessionBase):
    pass


class InterviewSessionRead(InterviewSessionBase):
    id: int
    time_started: datetime | None = None
    time_ended: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}