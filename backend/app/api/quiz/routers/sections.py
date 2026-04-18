from fastapi import APIRouter, HTTPException, Depends
from ..data import SECTIONS, UNITS_BY_SECTION, QUIZ_BY_UNIT

from auth.firebase_auth import get_current_user_id
from firebase.firebase_admin import db

router = APIRouter(tags=["sections"])

@router.get("/sections")
def list_sections():
    # frontend expects the same structure it already uses
    return SECTIONS

@router.get("/section/{section_id}")
def get_section(section_id: str, user_id: str = Depends(get_current_user_id)):
    data = UNITS_BY_SECTION.get(section_id)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")

    # Deep copy so we don't pollute global structure
    import copy
    result_data = copy.deepcopy(data)
    
    # Fetch user data for mastery and XP
    user_doc = db.collection("users").document(user_id).get()
    user_dict = user_doc.to_dict() or {}
    total_xp = user_dict.get("totalXP", 0)
    mastery = user_dict.get("mastery_scores", {})
    
    # Find weaknesses (tags with lowest negative scores, or lowest overall)
    # Only consider it a weakness if score <= 0
    weaknesses = [k for k, v in mastery.items() if v <= 0]
    # Sort them by lowest score
    weaknesses.sort(key=lambda x: mastery[x])
    top_weaknesses = set(weaknesses[:3])

    for unit in result_data["units"]:
        unit_id = unit["id"]
        
        # Phase 4 XP Lock
        req_xp = unit.get("required_xp", 0)
        unit["locked"] = total_xp < req_xp
        
        # Phase 3 Recommendation engine
        unit["is_recommended"] = False
        
        # Safely get tags for the unit
        quiz_data = QUIZ_BY_UNIT.get(unit_id)
        if quiz_data and top_weaknesses:
            unit_tags = set()
            for q in quiz_data.get("questions", []):
                unit_tags.update(q.get("tags", []))
            
            if unit_tags & top_weaknesses:
                unit["is_recommended"] = True

    return result_data
