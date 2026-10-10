import uuid
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from deps import get_user_id
from models.core import Document, UserProfile
from schemas.core import DocumentCreate, DocumentUpdate, DocumentResponse, ProfileInput
from engines.deadlines import get_document_flags

router = APIRouter(prefix="/api/documents", tags=["documents"])

def _get_move_deadline(db: Session, user_id: str) -> date | None:
    profile_model = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if profile_model and profile_model.profile:
        try:
            profile = ProfileInput.model_validate(profile_model.profile)
            return profile.goal.move_deadline
        except Exception:
            return None
    return None

def _format_doc_response(doc: Document, move_deadline: date | None) -> DocumentResponse:
    flags = get_document_flags(doc.label, doc.expires_on, move_deadline)
    return DocumentResponse(
        id=doc.id,
        label=doc.label,
        status=doc.status,
        expires_on=doc.expires_on,
        needs_translation=doc.needs_translation,
        needs_apostille=doc.needs_apostille,
        flags=flags
    )

@router.get("", response_model=List[DocumentResponse])
def list_documents(user_id: str = Depends(get_user_id), db: Session = Depends(get_db)):
    move_deadline = _get_move_deadline(db, user_id)
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    return [_format_doc_response(d, move_deadline) for d in docs]

@router.post("", response_model=DocumentResponse)
def create_document(
    data: DocumentCreate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    doc_id = str(uuid.uuid4())
    db_doc = Document(
        id=doc_id,
        user_id=user_id,
        label=data.label,
        status="todo",
        expires_on=data.expires_on,
        needs_translation=data.needs_translation,
        needs_apostille=data.needs_apostille
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    move_deadline = _get_move_deadline(db, user_id)
    return _format_doc_response(db_doc, move_deadline)

@router.patch("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: str,
    data: DocumentUpdate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    db_doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail={"code": "not_found", "message": "Document not found"})
        
    if data.status is not None:
        db_doc.status = data.status
    if data.expires_on is not None:
        db_doc.expires_on = data.expires_on
        
    db.commit()
    db.refresh(db_doc)
    
    move_deadline = _get_move_deadline(db, user_id)
    return _format_doc_response(db_doc, move_deadline)
