import chromadb
import google.generativeai as genai
from config import settings

# Configure GenAI
genai.configure(api_key=settings.GOOGLE_API_KEY)

# ChromaDB setup
db_client = chromadb.PersistentClient(path="./chroma_db")
collection = db_client.get_or_create_collection(
    name="gemini_collection",
    metadata={"hnsw:space": "cosine"}
)

def embed_text(text: str, task_type: str):
    """Generate embeddings using Gemini"""
    return genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type=task_type
    )['embedding']

def search_knowledge_base(query: str, n_results: int = 3) -> str:
    """
    Searches the vector store for relevant context.
    """
    if collection.count() == 0:
        return "Knowledge base is empty. Please upload documents first."

    query_embedding = embed_text(query, "RETRIEVAL_QUERY")
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
        include=["documents"]
    )
    
    context = "\n".join(results['documents'][0])
    return context if context else "No relevant documents found."