from firebase.firebase_admin import db
from firebase_admin.firestore import SERVER_TIMESTAMP

def ensure_user_document(user_id: str):
    user_ref = db.collection("users").document(user_id)
    doc = user_ref.get()

    if not doc.exists:
        user_ref.set(
            {
                "totalXP": 0,
                "level": 1,
                "streak": 0,
                "lastActiveDate": None,
                "createdAt": SERVER_TIMESTAMP
            },
            merge=True
        )
