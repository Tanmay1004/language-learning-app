# session_store.py (lean)
import time, uuid
from typing import Dict, Any, List

class SessionMem:
    def __init__(self, scenario_card: dict, level: str, strictness: float):
        self.id = str(uuid.uuid4())
        self.created_at = time.time()
        self.level = level
        self.strictness = strictness
        self.scenario_card = scenario_card
        self.history: List[Dict[str, str]] = []  # [{role:"user|assistant", "text": "..."}]

SESSIONS: Dict[str, SessionMem] = {}

def new_session(scenario_card: dict, level: str, strictness: float) -> SessionMem:
    s = SessionMem(scenario_card, level, strictness)
    SESSIONS[s.id] = s
    return s

def get_session(session_id: str) -> SessionMem:
    if session_id not in SESSIONS:
        raise KeyError("Session not found")
    return SESSIONS[session_id]

def end_session(session_id: str):
    SESSIONS.pop(session_id, None)
