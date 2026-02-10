# report.py (lean for LLM-only)
import json, os
from typing import Dict, Any
from .config import DATASET_DIR

def append_jsonl(session_id: str, obj: Dict[str, Any]):
    path = os.path.join(DATASET_DIR, f"session-{session_id}.jsonl")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
