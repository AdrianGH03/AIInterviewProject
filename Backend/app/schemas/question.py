from datetime import datetime
from pydantic import BaseModel

#refer to feedback.py, same concepts.
class QuestionBase(BaseModel):
    question_text: str
    question_type: str
    difficulty: str
    topic: str
    time_limit: int | None = None
    questionbank_id: int | None = None


class QuestionCreate(QuestionBase):
    pass


class QuestionRead(QuestionBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}