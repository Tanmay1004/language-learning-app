from typing import Dict, Any
from datetime import datetime, timezone

class AttemptStore:
    def __init__(self):
        # attemptId -> dict(unitId:str, selections:dict, result:dict|None, submittedAt:str|None)
        self.attempts: Dict[str, Dict[str, Any]] = {}

    def new_attempt(self, attempt_id: str, unit_id: str):
        self.attempts[attempt_id] = {
            "unitId": unit_id,
            "selections": {},
            "result": None,
            "submittedAt": None,
        }

    def upsert_answer(self, attempt_id: str, question_id: str, choice_id: str):
        self.attempts[attempt_id]["selections"][question_id] = choice_id

    def submit(self, attempt_id: str, result: dict):
        ts = datetime.now(timezone.utc).isoformat()
        self.attempts[attempt_id]["result"] = result
        self.attempts[attempt_id]["submittedAt"] = ts
        return ts

    def get(self, attempt_id: str):
        return self.attempts.get(attempt_id)

STORE = AttemptStore()
