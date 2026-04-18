from firebase.firebase_admin import db
from firebase_admin.firestore import SERVER_TIMESTAMP

def ensure_user_document(user_id: str):
    user_ref = db.collection("users").document(user_id)
    doc = user_ref.get()

    if not doc.exists:
        # New user → initialize everything including tag_xp
        user_ref.set(
            {
                "totalXP": 0,
                "level": 1,
                "streak": 0,
                "lastActiveDate": None,
                "createdAt": SERVER_TIMESTAMP,
                "tag_xp": {}  #  NEW FIELD
            },
            merge=True
        )
    else:
        # Existing user → ensure tag_xp exists
        user_data = doc.to_dict()

        if "tag_xp" not in user_data:
            user_ref.set(
                {
                    "tag_xp": {}
                },
                merge=True
            )