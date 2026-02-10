import random
from firebase.firebase_admin import db

TEMPLATES = [
    "I am practicing the word `{word}`",
    "Please help me pronounce `{word}` clearly",
    "I want to improve my pronunciation of `{word}`",
    "The word `{word}` is difficult for me to say",
    "I am trying to say `{word}` correctly",
    "I am working on pronouncing `{word}`",
    "I want to say `{word}` more clearly",
    "Help me get the pronunciation of `{word}` right",
    "I often mispronounce the word `{word}`",
    "I am learning how to pronounce `{word}`",
    "I want to sound more natural when saying `{word}`",
    "I am struggling with the pronunciation of `{word}`",
    "Please guide me on how to say `{word}`",
    "I want to say the word `{word}` confidently",
    "I am practicing saying `{word}` out loud"
]



def get_single_practice_sentence(user_id: str):
    errors_ref = (
        db.collection("users")
          .document(user_id)
          .collection("pronunciationStats")
          .document("errors")
    )

    snap = errors_ref.get()
    if not snap.exists:
        return None

    error_map = snap.to_dict() or {}
    if not error_map:
        return None

    # Weighted choice (higher score = higher chance)
    words = list(error_map.keys())
    weights = [error_map[w].get("score", 1) for w in words]

    word = random.choices(words, weights=weights, k=1)[0]
    template = random.choice(TEMPLATES)

    return {
        "word": word,
        "sentence": template.format(word=word)
    }
