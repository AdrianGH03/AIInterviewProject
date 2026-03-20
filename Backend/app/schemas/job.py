from pydantic import BaseModel, field_validator
from urllib.parse import urlparse


class JobURLRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("Only HTTP and HTTPS URLs are supported")
        if not parsed.netloc:
            raise ValueError("Invalid URL")
        return v


class GeneratedQuestion(BaseModel):
    text: str
    type: str = "coding"
    difficulty: str = "medium"


class JobCategory(BaseModel):
    name: str
    questions: list[GeneratedQuestion]


class JobParseRequest(BaseModel):
    text: str
    company_name: str = ""


class JobCategoryImport(BaseModel):
    name: str
    questions: list[GeneratedQuestion]


class JobBankCreateRequest(BaseModel):
    company_name: str
    categories: list[JobCategoryImport]


class JobParseResponse(BaseModel):
    categories: list[JobCategory]
    company_name: str = ""
    raw_text: str | None = None
