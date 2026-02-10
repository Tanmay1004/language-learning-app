from fastapi import APIRouter, Depends
from firebase_admin.firestore import Increment, SERVER_TIMESTAMP
from firebase.firebase_admin import db
from auth.firebase_auth import get_current_user_id
from datetime import date, datetime, timedelta

router = APIRouter(tags=["users"])


# -------------------------------
# Helper: authoritative streak logic
# -------------------------------
def compute_next_streak(last_active: str | None, current_streak: int) -> int:
    today = date.today()

    if not last_active:
        return 1

    try:
        last = datetime.fromisoformat(last_active).date()
    except Exception:
        return 1

    # 🔥 FIX: first-ever activity on same day
    if last == today:
        return current_streak if current_streak > 0 else 1

    if last == today - timedelta(days=1):
        return current_streak + 1

    return 1



# -------------------------------
# Health check
# -------------------------------
@router.get("/health")
def health():
    return {"ok": True}


# -------------------------------
# Get current user stats
# -------------------------------
@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    ref = db.collection("users").document(user_id)
    snap = ref.get()

    if not snap.exists:
        return {
            "totalXP": 0,
            "level": 1,
            "streak": 0,
            "lastActiveDate": None,
        }

    data = snap.to_dict() or {}
    return {
        "totalXP": data.get("totalXP", 0),
        "level": data.get("level", 1),
        "streak": data.get("streak", 0),
        "lastActiveDate": data.get("lastActiveDate"),
    }


# -------------------------------
# Add XP (authoritative backend logic)
# -------------------------------
@router.post("/xp")
def add_xp(payload: dict, user_id: str = Depends(get_current_user_id)):
    print("XP PAYLOAD:", payload)

    delta = int(payload.get("delta", 0))
    source = payload.get("source")  # 👈 IMPORTANT

    user_ref = db.collection("users").document(user_id)
    snap = user_ref.get()
    data = snap.to_dict() or {}

    prev_xp = data.get("totalXP", 0)
    prev_streak = data.get("streak", 0)
    last_active = data.get("lastActiveDate")

    new_xp = prev_xp + delta
    new_level = int((new_xp / 100) ** 0.5) + 1

    today = date.today()
    today_str = today.isoformat()

    print("STREAK INPUTS:", {
        "source": source,
        "delta": delta,
        "prev_streak": prev_streak,
        "last_active": last_active,
    })


    # 🔥 FIX: only update streak on REAL activity
    if source != "sync" and delta > 0:
        new_streak = compute_next_streak(last_active, prev_streak)
        last_active_to_set = today_str
    else:
        new_streak = prev_streak
        last_active_to_set = last_active
    
    print("NEW STREAK:", new_streak)


    user_ref.update({
        "totalXP": Increment(delta),
        "level": new_level,
        "streak": new_streak,
        "lastActiveDate": last_active_to_set,
        "updatedAt": SERVER_TIMESTAMP,
    })

    return {
        "totalXP": new_xp,
        "level": new_level,
        "streak": new_streak,
        "lastActiveDate": last_active_to_set,
    }
