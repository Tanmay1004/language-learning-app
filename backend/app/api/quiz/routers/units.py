from fastapi import APIRouter, HTTPException
from ..data import UNITS_BY_SECTION, QUIZ_BY_UNIT
from ..models import QuizSnapshot

router = APIRouter(tags=["units"])


@router.get("/sections/{section_id}/units")
def list_units(section_id: str):
    data = UNITS_BY_SECTION.get(section_id)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")
    return data


@router.get("/unit/{unit_id}/quiz", response_model=QuizSnapshot)
def get_quiz(unit_id: str):
    q = QUIZ_BY_UNIT.get(unit_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return q
