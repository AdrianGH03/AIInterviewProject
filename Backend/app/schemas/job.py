from pydantic import BaseModel, field_validator
from urllib.parse import urlparse

#refer to feedback.py, same concepts.
class JobURLRequest(BaseModel):
    url: str

    #Field_valdiator is used to declare custom validation logic for the url here
    @field_validator("url")
    #Defines method, validate_url that is part of the class instead of making a new class
    @classmethod
    #Validate_url takes the class name cls, and variable, str as parameters
    def validate_url(cls, v: str) -> str:
        parsed = urlparse(v)
        #parsed.scheme checks if its an actual http or https request, not SQL injection for ftp:// and such
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
