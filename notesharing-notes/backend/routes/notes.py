from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
import uuid
import os

from models.note import NoteUpdateRequest
from services.dynamodb_service import (
    create_note, get_note_by_id, get_all_notes, search_notes,
    get_notes_by_subject, update_note, delete_note, get_notes_by_uploader
)
from services.s3_service import upload_file, generate_presigned_download_url, delete_file, get_content_type, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from services.groq_service import summarize_note
from utils.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    try:
        if ext == ".pdf":
            import PyPDF2, io
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        elif ext in (".doc", ".docx"):
            import docx, io
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)
        elif ext == ".txt":
            return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        pass
    return ""


@router.post("/upload")
async def upload_note(
    title: str = Form(...),
    subject: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    note_id = str(uuid.uuid4())
    s3_key = f"notes/{current_user['user_id']}/{note_id}/{file.filename}"
    content_type = get_content_type(file.filename)

    file_url = upload_file(file_bytes, s3_key, content_type)
    content_text = extract_text(file_bytes, file.filename)

    ai_data = summarize_note(content_text or title, title) if content_text else {}

    now = datetime.now(timezone.utc).isoformat()
    note = {
        "note_id": note_id,
        "title": title,
        "description": description,
        "subject": subject.lower(),
        "tags": tags,
        "uploader_id": current_user["user_id"],
        "uploader_name": current_user.get("email", ""),
        "uploader_role": current_user.get("role", "student"),
        "file_key": s3_key,
        "file_name": file.filename,
        "file_type": ext.lstrip("."),
        "file_size": len(file_bytes),
        "content_text": content_text[:5000] if content_text else "",
        "ai_summary": ai_data.get("summary", ""),
        "ai_key_points": ai_data.get("key_points", []),
        "ai_tags": ", ".join(ai_data.get("tags", [])),
        "ai_difficulty": ai_data.get("difficulty", ""),
        "download_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    create_note(note)
    return note


@router.get("/")
async def list_notes(
    subject: str = Query(None),
    search: str = Query(None),
    limit: int = Query(50, le=100),
):
    if search:
        return search_notes(search)
    if subject:
        return get_notes_by_subject(subject.lower())
    return get_all_notes(limit)


@router.get("/my")
async def my_notes(current_user: dict = Depends(get_current_user)):
    return get_notes_by_uploader(current_user["user_id"])


@router.get("/{note_id}")
async def get_note(note_id: str):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.get("/{note_id}/download")
async def download_note(note_id: str, current_user: dict = Depends(get_current_user)):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    url = generate_presigned_download_url(note["file_key"])
    new_count = int(note.get("download_count", 0)) + 1
    update_note(note_id, {"download_count": new_count, "updated_at": datetime.now(timezone.utc).isoformat()})
    return {"download_url": url}


@router.put("/{note_id}")
async def edit_note(
    note_id: str,
    body: NoteUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note["uploader_id"] != current_user["user_id"] and current_user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to edit this note")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    if "subject" in updates:
        updates["subject"] = updates["subject"].lower()
    return update_note(note_id, updates)


@router.delete("/{note_id}")
async def remove_note(note_id: str, current_user: dict = Depends(get_current_user)):
    note = get_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note["uploader_id"] != current_user["user_id"] and current_user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to delete this note")

    delete_file(note["file_key"])
    delete_note(note_id)
    return {"message": "Note deleted"}
