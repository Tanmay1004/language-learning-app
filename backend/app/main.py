from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api.quiz.router import router as quiz_router
from app.api.chat.router import router as chat_router
from app.api.pronunciation.router import router as pronunciation_router
from app.api.users.router import router as users_router


app = FastAPI(title="Language Learning Backend")

setup_cors(app)

app.include_router(
    quiz_router,
    prefix="/api/quiz",
    tags=["quiz"]
)

app.include_router(
    chat_router, 
    prefix="/api/chat", 
    tags=["chat"]
)

app.include_router(
    pronunciation_router,
    prefix="/api/pronunciation",
    tags=["pronunciation"]
)

app.include_router(
    users_router,
    prefix="/api/users",
    tags=["users"]
)

