from pydantic import BaseModel
from typing import Optional, List

class NoteUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[str] = None
    content_text: Optional[str] = None

class NoteResponse(BaseModel):
    note_id: str
    title: str
    description: Optional[str] = ""
    subject: str
    tags: Optional[str] = ""
    uploader_id: str
    uploader_name: str
    uploader_role: str
    file_key: str
    file_name: str
    file_type: str
    file_size: int
    content_text: Optional[str] = ""
    ai_summary: Optional[str] = ""
    ai_tags: Optional[str] = ""
    download_count: int = 0
    created_at: str
    updated_at: str

class AIQuestionRequest(BaseModel):
    question: str

class AIQuizRequest(BaseModel):
    num_questions: int = 5
