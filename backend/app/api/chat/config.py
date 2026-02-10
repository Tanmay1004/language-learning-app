# config.py (lean for LLM-only)
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2:3b")

DATASET_DIR = os.getenv("DATASET_DIR", "dataset")
os.makedirs(DATASET_DIR, exist_ok=True)
