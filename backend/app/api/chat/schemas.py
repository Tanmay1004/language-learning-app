from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

class StartRequest(BaseModel):
    level: Literal["A1","A2","B1","B2","C1","C2"] = "C1"
    strictness: float = Field(ge=0.0, le=1.0, default=0.8)
    scenario_id: str = "drive_through_A2"

class StartResponse(BaseModel):
    session_id: str
    scenario_card: Dict[str, Any]

class ChatRequest(BaseModel):
    session_id: str
    user_text: str

class ChatResponse(BaseModel):
    corrections_md: str
    bot_reply: str

class EndRequest(BaseModel):
    session_id: str

class EndResponse(BaseModel):
    report_markdown: str
    report_json: Dict[str, Any]
