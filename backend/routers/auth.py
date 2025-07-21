import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# In-memory databases
fake_users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "password": "password123",
    }
}

fake_session_db = {}

def get_current_user(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No session cookie found",
        )
    
    if session_id not in fake_session_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    
    return fake_session_db[session_id]["username"]

@router.post("/login")
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    session_id = str(uuid.uuid4())
    fake_session_db[session_id] = {
        "username": user["username"],
        "created_at": datetime.now()
    }

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=3600
    )
    return {"message": f"Welcome, {user['username']}"}

@router.post("/logout")
def logout(response: Response, user: str = Depends(get_current_user)):
    session_id = next(
        (sid for sid, data in fake_session_db.items() 
         if data["username"] == user),
        None
    )
    if session_id:
        del fake_session_db[session_id]
    response.delete_cookie("session_id")
    return {"message": "Successfully logged out"}

@router.get("/me")
def read_users_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}