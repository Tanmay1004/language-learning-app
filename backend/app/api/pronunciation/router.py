import json
import re
import shutil
import subprocess
import uuid
import wave
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import Depends
from auth.firebase_auth import get_current_user_id
from services.users import ensure_user_document
from firebase.firebase_admin import db
from firebase_admin.firestore import SERVER_TIMESTAMP

from services.pronunciation_stats import update_pronunciation_error_map
from services.practice_sentences import get_single_practice_sentence


import difflib
from fastapi import File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from jiwer import wer
from vosk import KaldiRecognizer
from fastapi import APIRouter
from .config import (
    TMP_DIR,
    NORM_DIR,
    FFMPEG_PATH,
    VOSK_MODEL,
    PAUSE_THRESHOLD_S,
    PAUSE_STEP_S,
    FLUENCY_MAX_PENALTY,
    PUNCT_PAUSE_RANGES,
    PUNC_TOO_SHORT_SLACK_S,
    PUNC_TOO_LONG_SLACK_S,
    PUNC_MAX_PENALTY,
)


router = APIRouter(
    tags=["pronunciation"]
)


# =========================
# HELPERS: audio I/O
# =========================

def _safe_ext(filename: str) -> str:
    suffix = Path(filename or "").suffix.lower()
    return suffix if suffix in {".webm", ".wav", ".mp3", ".m4a", ".ogg"} else ".bin"

def _ffmpeg_to_wav16k_mono(src: Path, dst: Path) -> None:
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", str(src),
        "-ac", "1",
        "-ar", "16000",
        "-f", "wav",
        str(dst),
    ]
    try:
        subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=400,
            detail="ffmpeg failed to convert audio",
        ) from e


# =========================
# HELPERS: text + tokens
# =========================

_WORD_RE = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)?", re.IGNORECASE)
_PUNCT_RE = re.compile(r"[,\.\!\?\;\:\-\u2014]")  # includes em-dash

def _normalize_text_basic(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^\w\s']", " ", s)  # keep letters/digits/_/apostrophe
    return re.sub(r"\s+", " ", s)

def _tokenize_words_only(s: str) -> List[str]:
    return _normalize_text_basic(s).split() if s else []

def _parse_reference_with_punct(s: str) -> Tuple[List[str], List[Dict]]:
    """
    Returns:
      ref_tokens: normalized word tokens
      punct: list of {mark, after_ref_index, after_ref_word}
    """
    scan = re.finditer(r"[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?|[,\.\!\?\;\:\-\u2014]", s)
    ref_words: List[str] = []
    punct: List[Dict] = []
    last_word_idx: Optional[int] = None

    for m in scan:
        tok = m.group(0)
        if _PUNCT_RE.fullmatch(tok):
            if last_word_idx is not None:
                punct.append({"mark": tok, "after_ref_index": last_word_idx, "after_ref_word": None})
        else:
            ref_words.append(tok.lower())
            last_word_idx = len(ref_words) - 1

    ref_tokens = _tokenize_words_only(" ".join(ref_words))
    for p in punct:
        i = p["after_ref_index"]
        p["after_ref_word"] = ref_tokens[i] if 0 <= i < len(ref_tokens) else None
    return ref_tokens, punct

# =========================
# HELPERS: ASR + alignment
# =========================

def _recognize_words(wav_path: Path) -> Dict:
    """
    Returns:
      {
        "text": "recognized text",
        "words": [{ "word": str, "start": float, "end": float, "conf": float }, ...]
      }
    """
    with wave.open(str(wav_path), "rb") as wf:
        if wf.getnchannels() != 1 or wf.getframerate() != 16000:
            raise HTTPException(status_code=400, detail="WAV must be 16kHz mono")

        rec = KaldiRecognizer(VOSK_MODEL, wf.getframerate())
        rec.SetWords(True)

        words = []
        while True:
            data = wf.readframes(4000)
            if not data:
                break
            if rec.AcceptWaveform(data):
                part = json.loads(rec.Result())
                words.extend(part.get("result", []))
        final = json.loads(rec.FinalResult())
        words.extend(final.get("result", []))

    hyp = " ".join(w.get("word", "") for w in words).strip()
    return {"text": hyp, "words": words}

def _align_tokens(ref_tokens: List[str], hyp_tokens: List[str]):
    sm = difflib.SequenceMatcher(a=ref_tokens, b=hyp_tokens, autojunk=False)
    return sm.get_opcodes()

def _build_hyp_index_map(hyp_words: List[Dict]) -> Dict[int, Dict]:
    return {i: w for i, w in enumerate(hyp_words)}

def _map_conf(c: float) -> int:
    try:
        return int(round(max(0.0, min(1.0, float(c))) * 100))
    except Exception:
        return 0

# =========================
# HELPERS: fluency & punctuation
# =========================

def _compute_fluency_penalty(hyp_words: List[Dict]) -> Dict:
    if len(hyp_words) < 2:
        return {"penalty": 0, "max_pause": 0.0, "pause_count": 0}

    pauses = []
    for i in range(len(hyp_words) - 1):
        a, b = hyp_words[i], hyp_words[i + 1]
        if a.get("end") is not None and b.get("start") is not None:
            gap = float(b["start"]) - float(a["end"])
            if gap > 0:
                pauses.append(gap)

    if not pauses:
        return {"penalty": 0, "max_pause": 0.0, "pause_count": 0}

    max_pause = max(pauses)
    pause_count = sum(1 for g in pauses if g >= PAUSE_THRESHOLD_S)

    base = 1 if pause_count else 0
    extra = min(FLUENCY_MAX_PENALTY - 1, int(max(0.0, (max_pause - PAUSE_THRESHOLD_S)) // PAUSE_STEP_S))
    penalty = min(FLUENCY_MAX_PENALTY, base + extra)

    return {"penalty": penalty, "max_pause": round(max_pause, 2), "pause_count": pause_count}

def _evaluate_punctuation(
    punct_list: List[Dict],
    ref_to_hyp: List[Optional[int]],
    hyp_words: List[Dict],
) -> Dict:
    details: List[Dict] = []
    penalty = 0

    def next_aligned_after(ref_idx: int) -> Optional[int]:
        for k in range(ref_idx + 1, len(ref_to_hyp)):
            if ref_to_hyp[k] is not None:
                return ref_to_hyp[k]
        return None

    for p in punct_list:
        mark = p.get("mark")
        expected = PUNCT_PAUSE_RANGES.get(mark)
        after_ref = p.get("after_ref_word")
        expected_ms = None if not expected else f"{int(expected[0]*1000)}-{int(expected[1]*1000)}"

        if expected is None:
            details.append({"mark": mark, "after_ref": after_ref, "expected_pause_ms": expected_ms,
                            "actual_pause_ms": None, "status": "unknown"})
            continue

        left_h = ref_to_hyp[p["after_ref_index"]] if 0 <= p["after_ref_index"] < len(ref_to_hyp) else None
        right_h = next_aligned_after(p["after_ref_index"])

        if left_h is None or right_h is None:
            details.append({"mark": mark, "after_ref": after_ref, "expected_pause_ms": expected_ms,
                            "actual_pause_ms": None, "status": "unknown"})
            continue

        left_w = hyp_words[left_h]; right_w = hyp_words[right_h]
        if left_w.get("end") is None or right_w.get("start") is None:
            details.append({"mark": mark, "after_ref": after_ref, "expected_pause_ms": expected_ms,
                            "actual_pause_ms": None, "status": "unknown"})
            continue

        gap_s = max(0.0, float(right_w["start"]) - float(left_w["end"]))
        actual_ms = int(round(gap_s * 1000))

        min_s, max_s = expected
        too_short = gap_s < (min_s - PUNC_TOO_SHORT_SLACK_S)
        too_long  = gap_s > (max_s + PUNC_TOO_LONG_SLACK_S)

        status = "ok"
        if too_short or too_long:
            status = "too_short" if too_short else "too_long"
            penalty += 1

        details.append({
            "mark": mark, "after_ref": after_ref,
            "expected_pause_ms": expected_ms, "actual_pause_ms": actual_ms,
            "status": status
        })

    penalty = min(PUNC_MAX_PENALTY, penalty)
    return {"details": details, "penalty": penalty}

# =========================
# ROUTES
# =========================

@router.get("/health")
def health() -> Dict[str, bool]:
    return {"ok": True}

@router.get("/practice")
def get_practice_sentence(
    user_id: str = Depends(get_current_user_id)
):
    sentence = get_single_practice_sentence(user_id)

    return {
        "sentence": sentence  # null if none
    }

@router.post("/score")
async def score_audio(
    file: UploadFile = File(...),
    text: str = Form(...),
    user_id: str = Depends(get_current_user_id)
) -> JSONResponse:
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Reference 'text' is required")
    ensure_user_document(user_id)

    attempt_id = uuid.uuid4().hex #New attemptId

    # Save + normalize
    uid = uuid.uuid4().hex
    raw_path = TMP_DIR / f"{uid}{_safe_ext(file.filename)}"
    with raw_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    norm_path = NORM_DIR / f"{uid}.wav"
    _ffmpeg_to_wav16k_mono(raw_path, norm_path)

    # Recognize
    rec = _recognize_words(norm_path)
    hyp_text = rec["text"]
    hyp_words = rec["words"]

    # Tokenize + punctuation map
    ref_tokens, punct_list = _parse_reference_with_punct(text)
    hyp_tokens = _tokenize_words_only(hyp_text)

    # Edge: no hypothesis
    if not hyp_tokens:
        return JSONResponse({
            "overall": 0,
            "base_overall_before_fluency": 0,
            "label": "Needs work",
            "reference": text,
            "hypothesis": hyp_text,
            "reference_tokens": [
                {"ref": w, "status": "omission", "heard": None, "confidence_0_100": 0, "start": None, "end": None}
                for w in ref_tokens
            ],
            "insertions": [],
            "fluency": {"penalty_points": 0, "max_pause_s": 0.0, "pause_count": 0},
            "punctuation": [],
            "punctuation_penalty_points": 0,
            "hints": ["I couldn’t hear enough speech. Try again closer to the mic and speak clearly."]
        })

    # Base score (WER)
    base_overall = round(100 * (1 - wer(" ".join(ref_tokens), " ".join(hyp_tokens))))
    base_overall = max(0, min(100, base_overall))

    # Alignment + per-word labels
    opcodes = _align_tokens(ref_tokens, hyp_tokens)
    hyp_index_map = _build_hyp_index_map(hyp_words)

    reference_tokens_output: List[Dict] = []
    insertions_output: List[Dict] = []
    ref_to_hyp: List[Optional[int]] = [None] * len(ref_tokens)

    for tag, i1, i2, j1, j2 in opcodes:
        if tag == "equal":
            for k in range(i2 - i1):
                r_idx = i1 + k; h_idx = j1 + k
                ref_to_hyp[r_idx] = h_idx
                hmd = hyp_index_map.get(h_idx, {})
                reference_tokens_output.append({
                    "ref": ref_tokens[r_idx], "status": "correct",
                    "heard": hmd.get("word"),
                    "confidence_0_100": _map_conf(hmd.get("conf", 0.0)),
                    "start": hmd.get("start"), "end": hmd.get("end"),
                })

        elif tag == "replace":
            span = max(i2 - i1, j2 - j1)
            for k in range(span):
                r_idx = i1 + k; h_idx = j1 + k
                r_tok = ref_tokens[r_idx] if r_idx < i2 else None
                hmd = hyp_index_map.get(h_idx, None) if h_idx < j2 else None

                if r_tok is not None and hmd is not None:
                    ref_to_hyp[r_idx] = h_idx
                    reference_tokens_output.append({
                        "ref": r_tok, "status": "substitution",
                        "heard": hmd.get("word"),
                        "confidence_0_100": _map_conf(hmd.get("conf", 0.0)),
                        "start": hmd.get("start"), "end": hmd.get("end"),
                    })
                elif r_tok is not None and hmd is None:
                    reference_tokens_output.append({
                        "ref": r_tok, "status": "omission",
                        "heard": None, "confidence_0_100": 0,
                        "start": None, "end": None,
                    })
                elif r_tok is None and hmd is not None:
                    insertions_output.append({
                        "heard": hmd.get("word"),
                        "confidence_0_100": _map_conf(hmd.get("conf", 0.0)),
                        "start": hmd.get("start"), "end": hmd.get("end"),
                    })

        elif tag == "delete":
            for r_idx in range(i1, i2):
                reference_tokens_output.append({
                    "ref": ref_tokens[r_idx], "status": "omission",
                    "heard": None, "confidence_0_100": 0,
                    "start": None, "end": None,
                })

        elif tag == "insert":
            for h_idx in range(j1, j2):
                hmd = hyp_index_map.get(h_idx, {})
                insertions_output.append({
                    "heard": hmd.get("word"),
                    "confidence_0_100": _map_conf(hmd.get("conf", 0.0)),
                    "start": hmd.get("start"), "end": hmd.get("end"),
                })

    # Fluency penalty (independent of punctuation by design)
    fp = _compute_fluency_penalty(hyp_words)
    after_fluency = max(0, min(100, base_overall - fp["penalty"]))

    # Punctuation evaluation
    punc_eval = _evaluate_punctuation(punct_list, ref_to_hyp, hyp_words)
    final_overall = max(0, min(100, after_fluency - punc_eval["penalty"]))

    # Label
    label = "Excellent" if final_overall >= 90 else "Good" if final_overall >= 75 else "Needs work"

    # Hints
    hints: List[str] = []
    if any(t["status"] != "correct" for t in reference_tokens_output):
        hints.append("Focus on the red/orange words and try again.")
    if insertions_output:
        hints.append("Avoid adding extra filler words.")
    if fp["penalty"] > 0:
        hints.append(f"Reduce long pauses (max pause ~{fp['max_pause']}s).")
    if punc_eval["penalty"] > 0:
        for d in punc_eval["details"]:
            if d.get("status") in ("too_short", "too_long"):
                hints.append(f"Adjust pause after '{d.get('after_ref')}' ({d.get('mark')}).")
                break

    payload = {
        "overall": final_overall,
        "base_overall_before_fluency": base_overall,
        "label": label,
        "reference": text,
        "hypothesis": hyp_text,
        "reference_tokens": reference_tokens_output,
        "insertions": insertions_output,
        "fluency": {
            "penalty_points": fp["penalty"],
            "max_pause_s": fp["max_pause"],
            "pause_count": fp["pause_count"],
        },
        "punctuation": punc_eval["details"],
        "punctuation_penalty_points": punc_eval["penalty"],
    }
    if hints:
        payload["hints"] = hints

    attempt_ref = (
        db.collection("users")
          .document(user_id)
          .collection("pronunciationAttempts")
          .document(attempt_id)
    )

    attempt_ref.set({
        # --- summary (dashboard-friendly) ---
        "reference": text,
        "overall": final_overall,
        "label": label,
        "baseScore": base_overall,
        "fluencyPenalty": fp["penalty"],
        "punctuationPenalty": punc_eval["penalty"],

        # --- metadata ---
        "createdAt": SERVER_TIMESTAMP,

        # --- detailed data (for drill-down / analytics) ---
        "hypothesis": hyp_text,
        "referenceTokens": reference_tokens_output,
        "insertions": insertions_output,
        "fluency": {
            "penalty_points": fp["penalty"],
            "max_pause_s": fp["max_pause"],
            "pause_count": fp["pause_count"],
        },
        "punctuation": punc_eval["details"],
        "hints": hints if hints else []
    })

    update_pronunciation_error_map(
        user_id=user_id,
        reference_tokens=reference_tokens_output
    )


    return JSONResponse(payload)
