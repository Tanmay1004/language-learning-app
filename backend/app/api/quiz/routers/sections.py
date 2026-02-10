from fastapi import APIRouter, HTTPException
from ..data import SECTIONS, UNITS_BY_SECTION

router = APIRouter(tags=["sections"])

@router.get("/sections")
def list_sections():
    # frontend expects the same structure it already uses
    return SECTIONS

@router.get("/section/{section_id}")
def get_section(section_id: str):
    data = UNITS_BY_SECTION.get(section_id)
    if not data:
        raise HTTPException(status_code=404, detail="Section not found")

    return data
