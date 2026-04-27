from fastapi import APIRouter, HTTPException, Depends
from models.note import AIQuestionRequest, AIQuizRequest
from services.dynamodb_service import get_note_by_id
from services.groq_service import summarize_note, answer_question, generate_quiz
from utils.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/summarize/{note_id}")
async def ai_summarize(note_id: str, current_user: dict = Depends(get_current_user)):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    content = note.get("content_text", "") or note.get("description", "") or note.get("title", "")
    return summarize_note(content, note.get("title", ""))


@router.post("/ask/{note_id}")
async def ai_ask(note_id: str, body: AIQuestionRequest, current_user: dict = Depends(get_current_user)):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    context = note.get("content_text", "") or note.get("description", "")
    answer = answer_question(body.question, context, note.get("title", ""))
    return {"question": body.question, "answer": answer}


@router.post("/quiz/{note_id}")
async def ai_quiz(note_id: str, body: AIQuizRequest, current_user: dict = Depends(get_current_user)):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    content = note.get("content_text", "") or note.get("description", "")
    questions = generate_quiz(content, body.num_questions)
    return {"quiz": questions, "note_title": note.get("title", "")}
