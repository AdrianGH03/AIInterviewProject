"""Endpoints for job description parsing and question generation."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models import QuestionBank, Question
from app.schemas.job import (
    JobURLRequest,
    JobParseRequest,
    JobParseResponse,
    JobBankCreateRequest,
)
from app.schemas.question_bank import QuestionBankRead
from app.services.jobs.job_scraper import (
    fetch_job_description,
    categorize_and_generate_questions,
)

router = APIRouter(prefix="/jobs", tags=["Job Description"])


@router.post("/scrape-url")
async def scrape_job_url(request: JobURLRequest):
    """Fetch and extract job description text from a URL."""
    try:
        text = await fetch_job_description(request.url)
        if not text or len(text) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful content from the URL. Try pasting the description manually.",
            )
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to fetch URL. Try pasting the job description manually.",
        )


@router.post("/generate-questions", response_model=JobParseResponse)
async def generate_questions_from_description(request: JobParseRequest):
    """Analyze a job description and generate categorized interview questions."""
    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Job description is too short.")

    result = await categorize_and_generate_questions(request.text.strip())
    return JobParseResponse(
        categories=[
            {
                "name": cat.get("name", "General"),
                "questions": [
                    {
                        "text": q.get("text", ""),
                        "type": q.get("type", "coding"),
                        "difficulty": q.get("difficulty", "medium"),
                    }
                    for q in cat.get("questions", [])
                    if q.get("text")
                ],
            }
            for cat in result.get("categories", [])
        ],
        company_name=request.company_name,
        raw_text=request.text[:2000],
    )


@router.post("/create-banks", response_model=list[QuestionBankRead])
def create_banks_from_job(
    request: JobBankCreateRequest,
    db: Session = Depends(get_db),
):
    """Create question banks from job description categories."""
    created_banks = []
    for cat in request.categories:
        bank_name = f"{request.company_name} - {cat.name} Question Practice"
        bank = QuestionBank(
            topic=cat.name,
            name=bank_name,
            description=f"Generated from job description for {request.company_name}",
        )
        db.add(bank)
        db.flush()

        for q in cat.questions:
            question = Question(
                question_text=q.text,
                question_type=q.type or "coding",
                difficulty=q.difficulty or "medium",
                topic=cat.name,
                questionbank_id=bank.id,
            )
            db.add(question)

        created_banks.append(bank)

    db.commit()
    for b in created_banks:
        db.refresh(b)
        _ = b.questions  # trigger lazy load

    return created_banks
