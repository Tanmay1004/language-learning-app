from fastapi import APIRouter
from .routers import sections, units, attempts

router = APIRouter(tags=["quiz"])

router.include_router(sections.router)
router.include_router(units.router)
router.include_router(attempts.router)
