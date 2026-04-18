from fastapi import APIRouter, HTTPException, Depends
from uuid import uuid4

from ..models import AttemptCreate, AnswerUpsert, AttemptResult
from ..data import QUIZ_BY_UNIT, ANSWER_KEY
from ..store import STORE

from auth.firebase_auth import get_current_user_id
from firebase.firebase_admin import db
from firebase_admin.firestore import Increment, SERVER_TIMESTAMP

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
def submit_attempt(attempt_id: str, user_id: str = Depends(get_current_user_id)):
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

    # Track tag-level mastery
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

        # Calculate mastery delta for tags
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

    # Save the mastery scores + tag XP to Firestore
    user_ref = db.collection("users").document(user_id)
    updates = {"updatedAt": SERVER_TIMESTAMP}

    # Existing mastery system
    for tag, val in mastery_deltas.items():
        updates[f"mastery_scores.{tag}"] = Increment(val)

    # Tag XP system
    for tag, xp in tag_xp_updates.items():
        updates[f"tag_xp.{tag}"] = Increment(xp)

    # Total XP
    if total_xp_earned > 0:
        updates["totalXP"] = Increment(total_xp_earned)

    try:
        user_ref.set(updates, merge=True)
    except Exception as e:
        print("Failed to save progress to Firebase:", e)

    return result


@router.get("/attempt/{attempt_id}", response_model=AttemptResult)
def get_attempt(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    att = STORE.get(attempt_id)
    if not att or not att["result"]:
        raise HTTPException(status_code=404, detail="Attempt not found or not submitted")

    return att["result"]