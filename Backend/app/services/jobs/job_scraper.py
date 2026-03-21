import json
import logging
import re

import httpx
from bs4 import BeautifulSoup

from app.services.ai.ollama_service import query_ollama

logger = logging.getLogger(__name__)


async def fetch_job_description(url: str) -> str:
    
    #Basically create a request as a client from the url paramete inputted from frontend
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()

    #BeautifulSoup instance used to get url response text, and parser tool needed
    soup = BeautifulSoup(resp.text, "html.parser")

    #Removes HTML elements boilerplate that the parser doesn't need.
    for element in soup(["script", "style", "nav", "header", "footer", "noscript"]):
        element.decompose()

    #Try common job description selectors
    selectors = [
        ".job-description",
        ".description__text",
        '[class*="job-description"]',
        '[class*="jobDescription"]',
        '[class*="job_description"]',
        '[data-testid="job-description"]',
        ".posting-requirements",
        "article",
        "main",
    ]

    #Finds where job description or whatever selector appeared and cleans it to get the actual job ad as text.
    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            text = " ".join(
                el.get_text(separator="\n", strip=True) for el in elements
            )
            if len(text) > 100:
                return _clean_text(text)

    #Fallback to get the <body> HTML element contents if selectors fail.
    body = soup.find("body")
    text = (
        body.get_text(separator="\n", strip=True)
        if body
        else soup.get_text(separator="\n", strip=True)
    )
    return _clean_text(text)


#Basic string cleaning/validation, removes any funny characters
def _clean_text(text: str) -> str:
    """Clean extracted text."""
    lines = text.split("\n")
    cleaned = [line.strip() for line in lines if line.strip() and len(line.strip()) > 2]
    text = "\n".join(cleaned)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:5000]


async def categorize_and_generate_questions(job_description: str) -> dict:
    prompt = (
        "You are an expert technical recruiter and interview coach. "
        "Analyze the following job description and:\n"
        "1. Extract the key technical skills, technologies, and concepts mentioned.\n"
        "2. Group them into categories (e.g. 'Python', 'SQL', 'System Design', 'ETL', 'Agile', 'JavaScript', 'Cloud Computing', 'Data Structures', 'Behavioral', 'Algorithms', 'Coding', 'JavaScript', 'React', 'CI/CD', 'SQL', 'TypeScript', etc.).\n"
        "3. For each category (which would be its own question bank i.e. 30 JavaScript questions), generate exactly 30 interview questions with this distribution:\n"
        "   - 15 questions with difficulty 'easy'\n"
        "   - 10 questions with difficulty 'medium'\n"
        "   - 5 questions with difficulty 'hard'\n\n"
        "Return ONLY valid JSON in this exact format (no markdown, no explanation):\n"
        "{\n"
        '  "categories": [\n'
        "    {\n"
        '      "name": "Category Name",\n'
        '      "questions": [\n'
        '        {"text": "Question text here?", "type": "coding", "difficulty": "easy"},\n'
        '        {"text": "Another question?", "type": "coding", "difficulty": "medium"},\n'
        '        {"text": "Hard question?", "type": "coding", "difficulty": "hard"}\n'
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        'Valid types: "coding", "behavioral", "system_design"\n'
        'Valid difficulties: "easy", "medium", "hard"\n\n'
        "IMPORTANT: Generate exactly 30 questions per category (15 easy, 10 medium, 5 hard).\n\n"
        f"Job Description:\n{job_description}"
    )

    #Gets the Ollama response using the above prompt with query_ollama function from ollama_service.py
    response = await query_ollama(
        messages=[{"role": "user", "content": prompt}],
        system_prompt="You are a JSON-only response bot. Return ONLY valid JSON, no markdown fences, no explanation.",
    )

    #Finds the JSON object in the response using regex, and if it fails, just return an empty categories list.
    try:
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            return json.loads(json_match.group())
        return {"categories": []}
    except json.JSONDecodeError:
        logger.error("Failed to parse Ollama response as JSON: %s", response[:500])
        return {"categories": []}
