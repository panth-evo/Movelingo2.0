import sys
from pathlib import Path
from typing import List, Dict, Any

# Ensure we can import from the api directory
API_DIR = Path(__file__).resolve().parent.parent.parent / "services" / "api"
sys.path.append(str(API_DIR))

from sqlalchemy.orm import Session
from db import SessionLocal
from models.core import KnowledgeChunk

def get_session() -> Session:
    """Returns a database session for ingestion scripts."""
    return SessionLocal()

def save_chunks(db: Session, chunks_data: List[Dict[str, Any]]):
    """
    Takes a list of dictionaries containing chunk data and saves them to the KnowledgeChunk table.
    Expects keys: text, country, type, source. Optional: cefr, license, last_verified, embedding.
    """
    for data in chunks_data:
        chunk = KnowledgeChunk(
            text=data["text"],
            country=data["country"],
            type=data["type"],
            source=data["source"],
            cefr=data.get("cefr"),
            license=data.get("license"),
            last_verified=data.get("last_verified"),
            # For local tests or before Person C adds vectors, this can be an empty array/JSON
            embedding=data.get("embedding", [])
        )
        db.add(chunk)
    
    db.commit()
    print(f"Saved {len(chunks_data)} chunks to the database.")
