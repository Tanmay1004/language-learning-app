from firebase.firebase_admin import db
from firebase_admin import firestore
from firebase_admin.firestore import Increment, SERVER_TIMESTAMP


def record_attempt(user_id: str,
                   attempt_id: str,
                   unit_id: str,
                   section_id: str,
                   result: dict,
                   tag_results: dict,
                   xp_earned: int):
    """
    Writes:
    - quizAttempts (event log)
    - tagMastery (per-tag aggregation)

    Uses Firestore batch (atomic write)
    """

    batch = db.batch()

    # ───────────────────────────────
    # 1. quizAttempts (event log)
    # ───────────────────────────────
    attempt_ref = (
        db.collection("users")
        .document(user_id)
        .collection("quizAttempts")
        .document(attempt_id)
    )

    batch.set(attempt_ref, {
        "unitId": unit_id,
        "sectionId": section_id,
        "scorePercent": result["scorePercent"],
        "numCorrect": result["numCorrect"],
        "numTotal": result["numTotal"],
        "xpEarned": xp_earned,
        "tags": list(tag_results.keys()),
        "tagResults": tag_results,
        "submittedAt": SERVER_TIMESTAMP,
    })

    # ───────────────────────────────
    # 2. tagMastery (per tag aggregation)
    # ───────────────────────────────
    XP_PER_CORRECT = 10

    for tag, counts in tag_results.items():
        tag_ref = (
            db.collection("users")
            .document(user_id)
            .collection("tagMastery")
            .document(tag)
        )

        correct = counts.get("correct", 0)
        total = counts.get("total", 0)

        batch.set(tag_ref, {
            "tag": tag,
            "xp": Increment(correct * XP_PER_CORRECT),
            "attempts": Increment(total),
            "correct": Increment(correct),
            "lastUpdated": SERVER_TIMESTAMP,
        }, merge=True)

    # Commit batch (atomic)
    batch.commit()


def update_quiz_stats_transactional(user_id: str,
                                    unit_id: str,
                                    section_id: str,
                                    score: int):
    """
    Updates quizStats/{unit_id} using Firestore transaction:
    - attemptCount
    - averageScore (incremental mean)
    - highestScore
    - lastScore
    - lastAttemptedAt
    """

    stats_ref = (
        db.collection("users")
        .document(user_id)
        .collection("quizStats")
        .document(unit_id)
    )

    @firestore.transactional
    def update(transaction, ref):
        snapshot = ref.get(transaction=transaction)

        if snapshot.exists:
            data = snapshot.to_dict()
            prev_count = data.get("attemptCount", 0)
            prev_avg = data.get("averageScore", score)
            prev_high = data.get("highestScore", 0)
        else:
            prev_count = 0
            prev_avg = score
            prev_high = 0

        new_count = prev_count + 1

        # Incremental average formula
        new_avg = round(((prev_avg * prev_count) + score) / new_count, 1)

        new_high = max(prev_high, score)

        transaction.set(ref, {
            "unitId": unit_id,
            "sectionId": section_id,
            "attemptCount": new_count,
            "averageScore": new_avg,
            "highestScore": new_high,
            "lastScore": score,
            "lastAttemptedAt": SERVER_TIMESTAMP,
        }, merge=True)

    transaction = db.transaction()
    update(transaction, stats_ref)