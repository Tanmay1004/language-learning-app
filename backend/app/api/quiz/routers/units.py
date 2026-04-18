from fastapi import APIRouter, HTTPException, Depends
from ..data import UNITS_BY_SECTION, QUIZ_BY_UNIT
from ..models import QuizSnapshot

from auth.firebase_auth import get_current_user_id
from firebase.firebase_admin import db

router = APIRouter(tags=["units"])


@router.get("/sections/{section_id}/units")
def list_units(section_id: str, user_id: str = Depends(get_current_user_id)):
    data = UNITS_BY_SECTION.get(section_id)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")

    #  Get user tag_xp from Firestore
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() if user_doc.exists else {}
    user_tag_xp = user_data.get("tag_xp", {})

    updated_units = []

    for unit in data["units"]:
        required_xp = unit.get("required_xp", 0)
        required_tag = unit.get("required_tag")

        # Default: unlocked
        locked = False

        # Apply lock logic only if requirement exists
        if required_tag:
            user_xp = user_tag_xp.get(required_tag, 0)
            if user_xp < required_xp:
                locked = True

        # Add locked field to unit
        updated_unit = {**unit, "locked": locked}
        updated_units.append(updated_unit)

    return {
        "section": data["section"],
        "units": updated_units
    }


@router.get("/unit/{unit_id}/quiz", response_model=QuizSnapshot)
def get_quiz(unit_id: str):
    q = QUIZ_BY_UNIT.get(unit_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return q