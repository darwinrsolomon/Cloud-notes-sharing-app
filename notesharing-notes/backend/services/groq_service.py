from groq import Groq
from utils.config import settings
import re

def get_groq_client():
    if not settings.groq_api_key or settings.groq_api_key == "your-groq-api-key-here":
        return None
    return Groq(api_key=settings.groq_api_key)

def summarize_note(content: str, title: str = "") -> dict:
    client = get_groq_client()
    if not client:
        return {"summary": "AI summarization unavailable (add GROQ_API_KEY to .env)", "key_points": [], "tags": []}

    prompt = f"""You are an academic assistant. Summarize the following study notes and extract key information.

Title: {title}

Content:
{content[:4000]}

Provide a JSON response with:
1. "summary": A concise 3-5 sentence summary
2. "key_points": List of 5 most important key points
3. "tags": List of 5 relevant topic tags
4. "difficulty": "beginner", "intermediate", or "advanced"

Return ONLY valid JSON."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
        )
        raw = response.choices[0].message.content.strip()
        # Extract JSON from code block if present
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            import json
            return json.loads(match.group())
        return {"summary": raw, "key_points": [], "tags": [], "difficulty": "intermediate"}
    except Exception as e:
        return {"summary": f"Summarization error: {str(e)}", "key_points": [], "tags": [], "difficulty": "intermediate"}


def answer_question(question: str, context: str, note_title: str = "") -> str:
    client = get_groq_client()
    if not client:
        return "AI Q&A unavailable (add GROQ_API_KEY to .env)"

    prompt = f"""You are a helpful academic tutor. Answer the student's question based on the provided study notes.

Note Title: {note_title}
Study Notes:
{context[:3000]}

Student Question: {question}

Provide a clear, educational answer based on the notes above."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"


def generate_quiz(content: str, num_questions: int = 5) -> list:
    client = get_groq_client()
    if not client:
        return []

    prompt = f"""Generate {num_questions} multiple-choice quiz questions from these study notes.

Notes:
{content[:3000]}

Return a JSON array where each item has:
- "question": the question text
- "options": array of 4 answer choices (strings)
- "answer": the correct answer (one of the options)
- "explanation": brief explanation

Return ONLY valid JSON array."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=1500,
        )
        raw = response.choices[0].message.content.strip()
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if match:
            import json
            return json.loads(match.group())
        return []
    except Exception as e:
        return []
