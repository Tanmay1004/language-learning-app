from fastapi import APIRouter, HTTPException
from uuid import uuid4

from ..models import AttemptCreate, AnswerUpsert, AttemptResult
from ..data import QUIZ_BY_UNIT, ANSWER_KEY
from ..store import STORE

router = APIRouter(tags=["attempts"])


@router.post("/attempt")
def create_attempt(payload: AttemptCreate):
    unit_id = payload.unitId
    if unit_id not in QUIZ_BY_UNIT:
        raise HTTPException(status_code=404, detail="Unit not found or no quiz")

    attempt_id = f"att_{uuid4().hex[:8]}"
    STORE.new_attempt(attempt_id, unit_id)
    return {"attemptId": attempt_id}


@router.post("/attempt/{attempt_id}/answer")
def upsert_answer(attempt_id: str, payload: AnswerUpsert):
    att = STORE.get(attempt_id)
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")

    unit_id = att["unitId"]
    quiz = QUIZ_BY_UNIT[unit_id]

    # Validate question → choice relationship
    q = next((qq for qq in quiz["questions"] if qq["id"] == payload.questionId), None)
    if not q:
        raise HTTPException(status_code=422, detail="Question not in this unit")

    if not any(c["id"] == payload.choiceId for c in q["choices"]):
        raise HTTPException(status_code=422, detail="Choice not in this question")

    if att["result"] is not None:
        raise HTTPException(status_code=409, detail="Attempt already submitted")

    STORE.upsert_answer(attempt_id, payload.questionId, payload.choiceId)
    return {"ok": True}


@router.post("/attempt/{attempt_id}/submit", response_model=AttemptResult)
def submit_attempt(attempt_id: str):
    att = STORE.get(attempt_id)
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")

    # Idempotent submit
    if att["result"] is not None:
        return att["result"]

    unit_id = att["unitId"]
    quiz = QUIZ_BY_UNIT[unit_id]
    selections = att["selections"]

    num_correct = 0
    items = []

    for q in quiz["questions"]:
        qid = q["id"]
        your = selections.get(qid)
        correct = ANSWER_KEY[qid]
        is_correct = (your == correct)

        by_id = {c["id"]: c["text"] for c in q["choices"]}
        your_text = by_id.get(your) if your else "—"
        correct_text = by_id[correct]

        if is_correct:
            num_correct += 1

        items.append({
            "questionId": qid,
            "stem": q["stem"],
            "yourChoiceId": your,
            "yourChoiceText": your_text,
            "correctChoiceId": correct,
            "correctChoiceText": correct_text,
            "isCorrect": is_correct,
            "explanation": q.get("explanation"),
        })

    num_total = len(quiz["questions"])
    score_percent = round((num_correct / num_total) * 100)

    result = {
        "attemptId": attempt_id,
        "unitId": unit_id,
        "numCorrect": num_correct,
        "numTotal": num_total,
        "scorePercent": score_percent,
        "items": items,
    }

    STORE.submit(attempt_id, result)
    return result


@router.get("/attempt/{attempt_id}", response_model=AttemptResult)
def get_attempt(attempt_id: str):
    att = STORE.get(attempt_id)
    if not att or not att["result"]:
        raise HTTPException(status_code=404, detail="Attempt not found or not submitted")

    return att["result"]
