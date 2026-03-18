from datetime import datetime
from pydantic import BaseModel


class QuestionBankBase(BaseModel):
    topic: str
    name: str
    description: str | None = None


class QuestionBankCreate(QuestionBankBase):
    pass


class QuestionBankRead(QuestionBankBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}