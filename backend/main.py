from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, embed, workflow

app = FastAPI()

# Enhanced CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router, prefix="/auth")
app.include_router(embed.router, prefix="/embed")
app.include_router(workflow.router, prefix="/workflow")

@app.get("/")
def health_check():
    return {"status": "Backend is running and ready for workflows!"}