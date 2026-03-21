import httpx
#httpx, (async and await for ollama server) and env variables imported
from app.config import settings

#system prompts declare the prompts for the ollama model
SYSTEM_PROMPTS = {
    "technical": (
        "You are an experienced senior software engineer conducting a technical interview "
        "at a tech company hiring a new graduate engineer or entry-level developer. Your role is to evaluate the candidate's technical skills "
        "through focused, realistic interview questions.\n\n"
        "RULES:\n"
        "- Ask ONE clear question at a time. Do not ask multiple questions in a single turn. Wait for the answer to be complete before asking the next question. This means to eventually help them get a suitable answer before asking the next question.\n"
        "- After the candidate answers, carefully evaluate their response before declaring it "
        "correct or incorrect. Read their answer thoroughly and give credit for partial correctness, "
        "correct reasoning, or answers that demonstrate understanding even if imprecisely worded.\n"
        "- Only declare an answer WRONG if it is clearly, factually incorrect. If the answer is "
        "roughly correct or partially correct, acknowledge what they got right first, then note "
        "what was missed or could be improved.\n"
        "- Adjust difficulty based on the candidate's performance — go deeper if they answer well, "
        "simplify if they struggle.\n"
        "- Be conversational but professional. Use short, direct sentences.\n"
        "- If the candidate's answer is wrong, explain why briefly and give them a chance to correct "
        "before moving on to the next question.\n"
        "- For coding questions, describe the problem clearly with examples and expected input/output.\n"
        "- Do NOT provide the full answer unless the candidate explicitly gives up.\n"
        "- Keep each response under 150 words unless explaining a complex concept.\n"
    ),
    "behavioral": (
        "You are an experienced technical hiring manager conducting a behavioral interview "
        "at a tech company hiring a new graduate engineer or entry-level developer. Your role is to assess the candidate's soft skills, "
        "leadership, teamwork, and problem-solving through situational questions.\n\n"
        "RULES:\n"
        "- Ask ONE behavioral question at a time using the STAR framework "
        "(Situation, Task, Action, Result).\n"
        "- After the candidate answers, evaluate whether they used the STAR method effectively. "
        "Point out what was strong and what could be improved.\n"
        "- Ask follow-up questions to dig deeper into vague or incomplete answers.\n"
        "- Be warm and encouraging, but thorough in your evaluation.\n"
        "- Cover different competencies: leadership, conflict resolution, teamwork, "
        "failure handling, and communication.\n"
        "- Keep each response under 150 words.\n"
        "- Do NOT list multiple questions at once.\n"
    ),
}

DIFFICULTY_CONTEXT = {
    "easy": "Target entry-level / junior developer skills. Ask fundamental concepts and straightforward problems.",
    "medium": "Target entry-level / junior developer skills. Ask questions requiring deeper understanding and trade-off analysis.",
    "hard": "Target entry-level / junior developer skills. Ask questions involving system design, scalability, edge cases, and advanced concepts.",
}

# the _ at the beginning means private, so cant be shared outside this file.
# function to build the system prompt to the AI
def _build_system_prompt(
    interview_type: str, topic: str, difficulty: str
) -> str:
    base = SYSTEM_PROMPTS.get(interview_type, SYSTEM_PROMPTS["technical"])
    diff = DIFFICULTY_CONTEXT.get(difficulty, DIFFICULTY_CONTEXT["easy"])
    return f"{base}\n\nTopic: {topic}\n{diff}"

#1. Creates the system prompt
#2. Create the http rquest to ollama API using the model and system prompt, return it as parsed JSON.

async def query_ollama(
    messages: list[dict[str, str]],
    system_prompt: str = "",
) -> str:
    ollama_messages = []
    if system_prompt:
        ollama_messages.append({"role": "system", "content": system_prompt})
    ollama_messages.extend(messages)

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": ollama_messages,
                "stream": False,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"]


#Basically the past two functions combined to easily chat with Ollama
#Entire chat history is stored in messages, from AI chats to User inputs on frontend.
async def chat_with_ollama(
    messages: list[dict[str, str]],
    interview_type: str = "technical",
    topic: str = "General",
    difficulty: str = "easy",
) -> str:
    system_prompt = _build_system_prompt(interview_type, topic, difficulty)

    ollama_messages = [{"role": "system", "content": system_prompt}] + messages

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": ollama_messages,
                "stream": False,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["message"]["content"]

#Generates the ollama prompt for providing feedback
async def generate_feedback(
    question_text: str,
    answer_text: str,
    interview_type: str = "technical",
    topic: str = "General",
) -> str:
    prompt = (
        f"You are an expert {interview_type} interviewer providing a final session review.\n\n"
        f"Interview Topic: {topic}\n\n"
        f"Question/Context: {question_text}\n\n"
        f"Candidate's Response:\n{answer_text}\n\n"
        f"Provide a structured evaluation with:\n"
        f"1. **Overall Score**: X/10\n"
        f"2. **Strengths**: What the candidate did well\n"
        f"3. **Areas for Improvement**: Specific weaknesses and how to address them\n"
        f"4. **Key Takeaways**: 2-3 actionable tips for improvement\n"
        f"5. **Suggested Better Answer**: A brief example of an ideal response\n\n"
        f"Be specific, constructive, and actionable. Reference exact parts of the candidate's answer."
    )

    messages = [{"role": "user", "content": prompt}]
    return await chat_with_ollama(
        messages, interview_type=interview_type, topic=topic
    )


#Prompt the Ollama AI to create a opening question for start of interview then begin a chat with it.
async def generate_opening_question(
    interview_type: str, topic: str, difficulty: str
) -> str:
    messages = [
        {
            "role": "user",
            "content": (
                f"Begin this {interview_type} interview on the topic of {topic}. "
                f"Ask a single {difficulty}-level question to start. "
                f"Output only the question — give a greeting, no preamble, no numbering."
            ),
        }
    ]
    return await chat_with_ollama(
        messages,
        interview_type=interview_type,
        topic=topic,
        difficulty=difficulty,
    )
