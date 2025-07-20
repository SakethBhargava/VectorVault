import os
import tempfile
import google.generativeai as genai
import chromadb
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from config import settings
from routers.auth import get_current_user
from file_processor import extract_text_from_file

router = APIRouter()

# Configure Gemini
try:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
except Exception as e:
    raise RuntimeError(f"Failed to configure Gemini: {e}")

# ChromaDB setup
db_client = chromadb.PersistentClient(path="./chroma_db")
collection = db_client.get_or_create_collection(
    name="gemini_collection",
    metadata={"hnsw:space": "cosine"}
)

class TextData(BaseModel):
    id: str
    content: str

def embed_text(text: str, task_type: str) -> List[float]:
    """Generate embeddings using Gemini"""
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type=task_type
        )
        return result['embedding']
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )

@router.post("/batch-upload")
async def batch_upload(
    files: List[UploadFile] = File(...),
    user: str = Depends(get_current_user)
):
    """Process multiple files at once to populate the KnowledgeBase."""
    results = []
    for file in files:
        try:
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                content = await file.read()
                if len(content) > settings.MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail="File too large")
                tmp.write(content)
                tmp_path = tmp.name
            
            text, error = extract_text_from_file(tmp_path)
            if error or not text:
                raise ValueError(error or "No text extracted from file")
            
            embedding = embed_text(text, "RETRIEVAL_DOCUMENT")
            collection.upsert(
                documents=[text],
                embeddings=[embedding],
                ids=[file.filename]
            )
            results.append({
                "filename": file.filename,
                "status": "success",
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "detail": str(e)
            })
    return {"results": results}