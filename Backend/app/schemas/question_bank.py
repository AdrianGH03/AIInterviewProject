from datetime import datetime
from pydantic import BaseModel

#refer to feedback.py, same concepts.
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

#To avoid circular dependency, Question read is called here
#model_rebuild() replaces the string questionread above ^ with the real questionread imported.
from app.schemas.question import QuestionRead 

QuestionBankRead.model_rebuild()