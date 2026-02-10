from firebase.firebase_admin import db
from firebase_admin.firestore import SERVER_TIMESTAMP

CONF_THRESHOLD = 70
HARD_MISTAKE_INC = 1.0
SOFT_MISTAKE_INC = 0.4
CORRECT_DECAY = 0.8
REMOVE_THRESHOLD = 0.8


def update_pronunciation_error_map(user_id: str, reference_tokens: list[dict]):
    """
    reference_tokens: list of dicts from scoring output
    Each dict has: ref, status, confidence_0_100
    """

    errors_ref = (
        db.collection("users")
          .document(user_id)
          .collection("pronunciationStats")
          .document("errors")
    )

    snapshot = errors_ref.get()
    error_map = snapshot.to_dict() if snapshot.exists else {}

    now = SERVER_TIMESTAMP

    # Track which words were seen this attempt
    seen_words = set()

    for token in reference_tokens:
        word = token.get("ref")
        status = token.get("status")
        confidence = token.get("confidence_0_100", 0)

        if not word:
            continue

        seen_words.add(word)

        is_hard_mistake = status != "correct"
        is_soft_mistake = status == "correct" and confidence < CONF_THRESHOLD

        # ---------- MISTAKES ----------
        if is_hard_mistake or is_soft_mistake:
            inc = HARD_MISTAKE_INC if is_hard_mistake else SOFT_MISTAKE_INC

            if word not in error_map:
                error_map[word] = {
                    "score": inc,
                    "lastMistakeAt": now,
                }
            else:
                error_map[word]["score"] += inc
                error_map[word]["lastMistakeAt"] = now

        # ---------- CORRECT ----------
        else:
            # Only decay if word is already tracked
            if word in error_map:
                error_map[word]["score"] *= CORRECT_DECAY
                error_map[word]["lastCorrectAt"] = now

                if error_map[word]["score"] < REMOVE_THRESHOLD:
                    del error_map[word]

    # Write back only if something changed
    errors_ref.set(error_map, merge=True)
