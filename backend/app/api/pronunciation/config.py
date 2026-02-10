import shutil
from pathlib import Path
from vosk import Model

# =========================
# PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
TMP_DIR = BASE_DIR / "tmp"
NORM_DIR = BASE_DIR / "normalized"
MODEL_DIR = BASE_DIR / "models" / "vosk-model-en-us-0.22"

TMP_DIR.mkdir(parents=True, exist_ok=True)
NORM_DIR.mkdir(parents=True, exist_ok=True)

# =========================
# FFMPEG
# =========================

FFMPEG_PATH = shutil.which("ffmpeg")
if not FFMPEG_PATH:
    raise RuntimeError("FFmpeg not found on PATH")

# =========================
# VOSK
# =========================

if not MODEL_DIR.exists():
    raise RuntimeError(f"Vosk model not found at {MODEL_DIR}")

VOSK_MODEL = Model(str(MODEL_DIR))

# =========================
# TUNABLES
# =========================

PAUSE_THRESHOLD_S = 0.6
PAUSE_STEP_S = 0.3
FLUENCY_MAX_PENALTY = 5

PUNCT_PAUSE_RANGES = {
    ",": (0.15, 0.50),
    ";": (0.20, 0.70),
    ":": (0.20, 0.70),
    "-": (0.15, 0.50),
    "—": (0.20, 0.70),
    ".": (0.30, 1.20),
    "!": (0.30, 1.20),
    "?": (0.30, 1.20),
}

PUNC_TOO_SHORT_SLACK_S = 0.05
PUNC_TOO_LONG_SLACK_S = 0.30
PUNC_MAX_PENALTY = 5
