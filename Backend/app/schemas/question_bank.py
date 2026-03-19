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
    questions: list["QuestionRead"] = []

    model_config = {"from_attributes": True}


from app.schemas.question import QuestionRead  # noqa: E402

QuestionBankRead.model_rebuild()