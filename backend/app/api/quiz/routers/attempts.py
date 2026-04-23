from fastapi import APIRouter, HTTPException, Depends
from uuid import uuid4

from ..models import AttemptCreate, AnswerUpsert, AttemptResult
from ..data import QUIZ_BY_UNIT, ANSWER_KEY
from ..store import STORE

from auth.firebase_auth import get_current_user_id
from firebase.firebase_admin import db
from firebase_admin.firestore import Increment, SERVER_TIMESTAMP

# ✅ ADD THIS
from services.quiz_analytics import record_attempt, update_quiz_stats_transactional

from ..data import get_section_id_by_unit


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
def submit_attempt(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    att = STORE.get(attempt_id)
    if not att:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if att["result"] is not None:
        return att["result"]

    unit_id = att["unitId"]
    quiz = QUIZ_BY_UNIT[unit_id]
    selections = att["selections"]

    num_correct = 0
    items = []

    mastery_deltas = {}
    XP_PER_CORRECT = 10
    total_xp_earned = 0
    tag_xp_updates = {}

    for q in quiz["questions"]:
        qid = q["id"]
        your = selections.get(qid)
        correct = ANSWER_KEY.get(qid)
        is_correct = (your == correct)

        by_id = {c["id"]: c["text"] for c in q["choices"]}
        your_text = by_id.get(your) if your else "—"
        correct_text = by_id.get(correct, "Unknown")

        if is_correct:
            num_correct += 1
            total_xp_earned += XP_PER_CORRECT

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

        tags = q.get("tags", [])
        delta = 1 if is_correct else -1

        if is_correct:
            for t in tags:
                tag_xp_updates[t] = tag_xp_updates.get(t, 0) + XP_PER_CORRECT

        for t in tags:
            mastery_deltas[t] = mastery_deltas.get(t, 0) + delta

    num_total = len(quiz["questions"])
    score_percent = round((num_correct / num_total) * 100) if num_total > 0 else 0

    result = {
        "attemptId": attempt_id,
        "unitId": unit_id,
        "numCorrect": num_correct,
        "numTotal": num_total,
        "scorePercent": score_percent,
        "items": items,
    }

    STORE.submit(attempt_id, result)

    user_ref = db.collection("users").document(user_id)
    updates = {"updatedAt": SERVER_TIMESTAMP}

    for tag, val in mastery_deltas.items():
        updates[f"mastery_scores.{tag}"] = Increment(val)

    for tag, xp in tag_xp_updates.items():
        updates[f"tag_xp.{tag}"] = Increment(xp)

    if total_xp_earned > 0:
        updates["totalXP"] = Increment(total_xp_earned)

    try:
        user_ref.set(updates, merge=True)
    except Exception as e:
        print("Failed to save progress to Firebase:", e)

    # ✅ ADD THIS BLOCK (analytics collections)
    tag_results = {}
    for q in quiz["questions"]:
        tags = q.get("tags", [])
        is_correct = (selections.get(q["id"]) == ANSWER_KEY.get(q["id"]))

        for t in tags:
            if t not in tag_results:
                tag_results[t] = {"correct": 0, "total": 0}

            tag_results[t]["total"] += 1
            if is_correct:
                tag_results[t]["correct"] += 1

    record_attempt(
        user_id=user_id,
        attempt_id=attempt_id,
        unit_id=unit_id,
        section_id = get_section_id_by_unit(unit_id),
        result=result,
        tag_results=tag_results,
        xp_earned=total_xp_earned
    )

    update_quiz_stats_transactional(
        user_id=user_id,
        unit_id=unit_id,
        section_id = get_section_id_by_unit(unit_id),
        score=score_percent
    )

    return result


@router.get("/attempt/{attempt_id}", response_model=AttemptResult)
def get_attempt(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    att = STORE.get(attempt_id)
    if not att or not att["result"]:
        raise HTTPException(status_code=404, detail="Attempt not found or not submitted")

    return att["result"]