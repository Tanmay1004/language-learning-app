import difflib
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi import APIRouter
import re, json
from typing import List, Tuple, Set, Optional
from collections import Counter

from fastapi import Depends
from datetime import date
from firebase_admin.firestore import Increment
from firebase.firebase_admin import db
from auth.firebase_auth import get_current_user_id
from firebase_admin import firestore


from .schemas import StartRequest, StartResponse, ChatRequest, ChatResponse, EndRequest, EndResponse
from .session_store import new_session, get_session, end_session
from .llm_client import correct_text, generate_reply, stream_correct_text, stream_reply
from .report import append_jsonl

router = APIRouter(tags=["chat"])


SCENARIOS = {
    "drive_through_A2": {
        "id": "drive_through_A2",
        "brief": "Drive-through order-taking role. Greet customers, suggest items, handle questions, prices, and payment politely.",
        "targets": ["requests", "numbers", "polite forms", "present simple/progressive"]
    },
    "mall_help_B1": {
        "id": "mall_help_B1",
        "brief": (
            "Mall information desk role. Help visitors find stores and facilities. "
            "The mall has clothing stores, electronics shops, a food court, restrooms, "
            "escalators, elevators, and parking. Give clear directions and offer help politely. "
            "Do not invent brand names unless the user mentions one."
        ),
        "targets": ["directions", "clarifying questions", "polite requests"]
    },
    "airport_help_A2": {
        "id": "airport_help_A2",
        "brief": (
            "Airport information desk role. Help passengers with basic airport navigation. "
            "The airport has check-in counters, security screening, departure gates, arrival halls, "
            "restrooms, baggage claim, elevators, escalators, and seating areas. "
            "Give clear directions, explain simple procedures, and answer common travel questions politely. "
            "Do not invent airline names, gate numbers, or flight details unless the user mentions them."
        ),
        "targets": [
            "directions",
            "polite requests",
            "present simple",
            "simple future (boarding, departure)",
            "question forms"
        ]
    },
    "hotel_reception_A2": {
        "id": "hotel_reception_A2",
        "brief": (
            "Hotel front desk role. Help guests with common hotel-related requests and questions. "
            "Handle check-in and check-out conversations, confirm reservations, explain breakfast timing, "
            "Wi-Fi access, and basic hotel rules politely. "
            "Guests may ask about room issues, late check-out, or directions to nearby places. "
            "Do not invent room numbers, prices, or booking details unless the user provides them."
        ),
        "targets": [
            "polite requests",
            "present simple",
            "modal verbs (can, could, would)",
            "time expressions",
            "question forms"
        ]
    },
    "restaurant_table_service_A2": {
        "id": "restaurant_table_service_A2",
        "brief": (
            "Restaurant table service role. Interact with guests who are seated at a table. "
            "Greet customers, explain the menu at a high level, take food and drink orders, "
            "handle simple preferences or restrictions, and respond politely to follow-up questions. "
            "Guests may ask for recommendations, request changes to an order, or ask for the bill. "
            "Do not invent dish names, ingredients, or prices unless the user mentions them."
        ),
        "targets": [
            "ordering food and drinks",
            "polite requests",
            "preferences and choices",
            "present simple",
            "modal verbs (would like, could, can)"
        ]
    },
    "doctor_appointment_B1": {
        "id": "doctor_appointment_B1",
        "brief": (
            "Doctor's appointment role. Speak with a patient about common health concerns. "
            "Ask about symptoms, duration, and general discomfort, and respond in a calm, supportive way. "
            "Patients may describe how they feel, ask simple questions about medicine timing, "
            "or ask when they should return. "
            "Do not give medical diagnoses, prescribe specific medicines, or give emergency advice."
        ),
        "targets": [
            "describing symptoms",
            "present perfect vs past simple",
            "time expressions (since, for, recently)",
            "polite questions",
            "clarifying information"
        ]
    },
    "job_interview_B2": {
        "id": "job_interview_B2",
        "brief": (
            "Job interview role. Act as an interviewer in a professional setting. "
            "Ask clear, standard interview questions and respond to the candidate's answers politely. "
            "Candidates may talk about their background, skills, experience, and career goals. "
            "They may ask about the role or next steps. "
            "Do not invent company-specific details, job titles, salaries, or hiring decisions unless the user mentions them."
        ),
        "targets": [
            "talking about experience",
            "past simple vs present perfect",
            "formal tone",
            "answering open-ended questions",
            "asking clarification questions"
        ]
    }

}


# ---------------- Tokenization & helpers ----------------

def _normalize_txt(x: str) -> str:
    x = (x or "")
    x = x.replace("’", "'").replace("“", "\"").replace("”", "\"")
    x = re.sub(r"\s+", " ", x)
    return x.strip()

def _word_tokens(text: str) -> list[str]:
    # Keep punctuation as separate tokens so we can detect , . ? edits
    return re.findall(r"[A-Za-z']+|[0-9]+|[^\sA-Za-z0-9]", text or "")

def _sentences(text: str) -> list[str]:
    # Simple, robust sentence splitter for short learner texts
    # Splits on ., ?, ! while keeping minimal noise
    parts = re.split(r"(?<=[.!?])\s+", (text or "").strip())
    parts = [p for p in parts if p]
    return parts

def _token_diff_ratio(src: str, dst: str) -> float:
    a, b = _word_tokens(src), _word_tokens(dst)
    if not a:
        return 0.0 if not b else 1.0
    # fraction of tokens that changed via Levenshtein-ish approximation using SequenceMatcher
    import difflib
    sm = difflib.SequenceMatcher(a=a, b=b)
    unchanged = sum(triple.size for triple in sm.get_matching_blocks())
    total = max(len(a), len(b)) or 1
    changed = total - unchanged
    return changed / total

# ---------------- Diff + labeling for Issues & Fixes ----------------

def _clean_corrected_version(text: str) -> str:
    # Remove <<< >>> wrappers if the model emitted them
    text = (text or "").strip()
    text = re.sub(r"<<<|>>>", "", text)
    text = re.sub(r"^<+|>+$", "", text).strip()
    return text

def _extract_corrected_and_bullets(corrections_md: str) -> tuple[str, list[str]]:
    if not corrections_md:
        return "", []
    s = corrections_md.replace("\r\n","\n")

    m_cv = re.search(
        r"Corrected\s+version\s*:\s*(.*?)(?:\n\s*\n|^\s*Issues\s*&\s*fixes\s*:|\Z)",
        s, flags=re.IGNORECASE | re.DOTALL | re.MULTILINE
    )
    corrected = (m_cv.group(1).strip() if m_cv else "").strip()
    corrected = _clean_corrected_version(corrected)

    m_if = re.search(
        r"^\s*Issues\s*&\s*fixes\s*:\s*(.*)\Z",
        s, flags=re.IGNORECASE | re.DOTALL | re.MULTILINE
    )
    bullets_block = m_if.group(1).strip() if m_if else ""
    bullets = []
    if bullets_block:
        for line in bullets_block.splitlines():
            if re.match(r"^\s*[-*]\s+", line):
                bullets.append(line.strip())
    return corrected, bullets

def _diff_ops(src: str, dst: str):
    import difflib
    a = _word_tokens(src)
    b = _word_tokens(dst)
    sm = difflib.SequenceMatcher(a=a, b=b)
    ops = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        src_span = " ".join(a[i1:i2]).strip()
        dst_span = " ".join(b[j1:j2]).strip()
        if tag == "replace":
            ops.append(("replace", src_span, dst_span))
        elif tag == "delete":
            ops.append(("delete", src_span, ""))
        elif tag == "insert":
            ops.append(("insert", "", dst_span))
    return ops

# --- Reasoning helpers (improved contraction detection first) ---

_CONTRACTIONS = {
    "i'm": "i am", "you're": "you are", "we're": "we are", "they're": "they are",
    "he's": "he is", "she's": "she is", "it's": "it is", "it’s": "it is",
    "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
    "i'd": "i would", "you'd": "you would", "he'd": "he would", "she'd": "she would", "we'd": "we would", "they'd": "they would",
    "i'll": "i will", "you'll": "you will", "he'll": "he will", "she'll": "she will", "we'll": "we will", "they'll": "they will",
    "can't": "cannot", "won't": "will not", "don't": "do not", "doesn't": "does not", "didn't": "did not",
    "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not",
    "shouldn't": "should not", "wouldn't": "would not", "couldn't": "could not",
    "let's": "let us",
}

def _looks_like_contraction_change(b: str, a: str) -> bool:
    bl, al = b.lower().strip(), a.lower().strip()
    # direct map or reverse map
    if bl in _CONTRACTIONS and _CONTRACTIONS[bl] == al:
        return True
    for c, exp in _CONTRACTIONS.items():
        if bl == exp and al == c:
            return True
    return False

_IRREGULAR_PAST = {
    "be": "was", "am": "was", "is": "was", "are": "were",
    "begin": "began", "break": "broke", "bring": "brought", "build": "built",
    "buy": "bought", "catch": "caught", "choose": "chose", "come": "came",
    "cost": "cost", "cut": "cut", "do": "did", "draw": "drew",
    "drink": "drank", "drive": "drove", "eat": "ate", "fall": "fell",
    "feel": "felt", "fight": "fought", "find": "found", "fly": "flew",
    "forget": "forgot", "forgive": "forgave", "get": "got", "give": "gave",
    "go": "went", "grow": "grew", "have": "had", "hear": "heard",
    "hold": "held", "keep": "kept", "know": "knew", "lay": "laid",
    "lead": "led", "leave": "left", "lend": "lent", "let": "let",
    "lose": "lost", "make": "made", "mean": "meant", "meet": "met",
    "pay": "paid", "put": "put", "read": "read", "ride": "rode",
    "ring": "rang", "rise": "rose", "run": "ran", "say": "said",
    "see": "saw", "sell": "sold", "send": "sent", "set": "set",
    "shake": "shook", "shine": "shone", "shoot": "shot", "show": "showed",
    "sing": "sang", "sit": "sat", "sleep": "slept", "speak": "spoke",
    "spend": "spent", "stand": "stood", "swim": "swam", "take": "took",
    "teach": "taught", "tear": "tore", "tell": "told", "think": "thought",
    "throw": "threw", "understand": "understood", "wear": "wore",
    "win": "won", "write": "wrote", "bite": "bit", "blow": "blew",
    "feed": "fed", "hang": "hung", "hide": "hid", "lie": "lay",
    "light": "lit", "seek": "sought", "slide": "slid", "spoil": "spoilt",
    "steal": "stole", "stick": "stuck", "sweep": "swept", "swing": "swung",
    "arise": "arose", "bear": "bore", "bend": "bent", "bet": "bet",
    "bleed": "bled", "breed": "bred", "burst": "burst", "creep": "crept",
    "deal": "dealt", "dig": "dug", "freeze": "froze", "forbid": "forbade",
    "hurt": "hurt", "kneel": "knelt", "lean": "leant", "smell": "smelt",
    "sting": "stung", "strike": "struck", "swear": "swore", "wake": "woke",
    "weave": "wove", "weep": "wept", "bind": "bound", "burn": "burnt",
    "broadcast": "broadcast", "fit": "fit", "hit": "hit", "quit": "quit",
    "shut": "shut", "spread": "spread", "split": "split", "upset": "upset",
}


_COLLOQUIAL = {
    "gonna": "going to", "wanna": "want to", "gotta": "have to",
    "kinda": "kind of", "sorta": "sort of", "lemme": "let me",
}

def _punctuation_label(before: str, after: str) -> str:
    # Look for the most-significant punctuation in the 'after' text (order matters)
    txt = (after or "")
    if "?" in txt: 
        return "question mark"
    if "." in txt:
        return "period"
    if "," in txt:
        return "comma"
    if "!" in txt:
        return "exclamation"
    if ":" in txt:
        return "colon"
    if ";" in txt:
        return "semicolon"
    return "punctuation"


_IRREGULAR_ADJ = {
    "good": ("better", "best"),
    "well": ("better", "best"),
    "bad": ("worse", "worst"),
    "far": ("farther", "farthest"),
    "further": ("further", "furthest"),
    "little": ("less", "least"),
    "few": ("fewer", "fewest"),
    "many": ("more", "most"),
    "much": ("more", "most"),
    "late": ("later", "latest"),
    "old": ("older", "oldest"),
    "ill": ("worse", "worst"),
    "fun": ("more fun", "most fun"),
    "near": ("nearer", "nearest"),
    "friendly": ("friendlier", "friendliest"),
    "simple": ("simpler", "simplest"),
    "gentle": ("gentler", "gentlest"),
    "narrow": ("narrower", "narrowest"),
    "clever": ("cleverer", "cleverest"),
    "quiet": ("quieter", "quietest"),
}

def _strip_common_suffixes(w: str) -> str:
    wl = w.lower()
    if wl.endswith("iest") and len(wl) > 4:   # happy -> happiest
        return wl[:-4] + "y"
    if wl.endswith("ier") and len(wl) > 3:    # happy -> happier
        return wl[:-3] + "y"
    if wl.endswith("est") and len(wl) > 3:    # big -> biggest
        return wl[:-3]
    if wl.endswith("er") and len(wl) > 2:     # big -> bigger
        return wl[:-2]
    if wl.endswith(("r", "st")) and wl[:-1] + "e" in ("large", "nice", "wise", "rude", "safe"):
        return wl[:-1] + "e"
    return wl

def _is_comparative_superlative(before: str, after: str) -> bool:
    b = before.lower().strip()
    a = after.lower().strip()
    if not b or not a:
        return False
    if b in _IRREGULAR_ADJ:
        comp, sup = _IRREGULAR_ADJ[b]
        if a == comp or a == sup:
            return True
    for base, (comp, sup) in _IRREGULAR_ADJ.items():
        if b in (comp, sup) and a == base:
            return True
    if a.endswith(("er", "est")) or b.endswith(("er", "est")):
        stem_b = _strip_common_suffixes(b)
        stem_a = _strip_common_suffixes(a)
        if stem_a == stem_b and len(stem_a) >= 2:
            return True
    if re.match(r"^(more|most)\s+\w+", a) or re.match(r"^(more|most)\s+\w+", b):
        return True
    if re.match(r"^(less|least)\s+\w+", a) or re.match(r"^(least|less)\s+\w+", b):
        return True
    if (" than" in a and " than" not in b) or (" than" in b and " than" not in a):
        return True
    return False

_VOWELS = set("aeiou")

def _is_regular_past_ed(b: str, a: str) -> bool:
    bl, al = b.lower(), a.lower()
    if not bl or not al:
        return False
    if bl.endswith("e") and al == bl + "d":
        return True
    if len(bl) >= 3 and bl[-1] not in _VOWELS and bl[-2] in _VOWELS and bl[-3] not in _VOWELS:
        if al == bl + bl[-1] + "ed":
            return True
    if bl.endswith("y") and (len(bl) >= 2 and bl[-2] not in _VOWELS) and al == bl[:-1] + "ied":
        return True
    if al == bl + "ed":
        return True
    return False

def _is_progressive_ing(b: str, a: str) -> bool:
    bl, al = b.lower(), a.lower()
    if not bl or not al:
        return False
    if bl.endswith("e") and al == bl[:-1] + "ing":
        return True
    if len(bl) >= 3 and bl[-1] not in _VOWELS and bl[-2] in _VOWELS and bl[-3] not in _VOWELS:
        if al == bl + bl[-1] + "ing":
            return True
    if al == bl + "ing":
        return True
    return False

def _is_plural_or_3rd_s(b: str, a: str) -> bool:
    bl, al = b.lower(), a.lower()
    if not bl or not al:
        return False
    if al == bl + "es":
        return True
    if bl.endswith("y") and (len(bl) >= 2 and bl[-2] not in _VOWELS) and al == bl[:-1] + "ies":
        return True
    if al == bl + "s":
        return True
    return False

_DETERMINERS = {
    "a", "an", "the",
    "this", "that", "these", "those",
    "my", "your", "his", "her", "its", "our", "their",
    "some", "any", "each", "every", "no", "another", "either", "neither", "both", "all", "several", "few", "many", "much", "little"
}

def _is_article_or_determiner_token(w: str) -> bool:
    return w.lower() in _DETERMINERS

# ---------------- New lightweight grammatical detectors ----------------

_MODALS = {"can", "could", "may", "might", "will", "would", "shall", "should", "must", "ought", "dare"}
_PREPOSITIONS = {
    "in","on","at","for","to","with","from","about","as","by","into","through",
    "during","before","after","above","below","over","under","between","among","against","towards","upon","within","without","along","across"
}
_AUX_FORMS = {"am","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","shall","should","may","might","must","can","could"}
_PRONOUNS = {"i","you","he","she","we","they","me","him","her","us","them","it","mine","yours","his","hers","ours","theirs"}
_CONJUNCTIONS = {"and","or","but","so","because","although","though","yet","for","nor","since","unless","while","whereas"}


def _token_is_in_set(span: str, the_set: set[str]) -> bool:
    if not span or not the_set:
        return False
    # check each token separately
    for t in re.findall(r"[\w']+", span.lower()):
        if t in the_set:
            return True
    return False


def _is_modal_change(b: str, a: str) -> bool:
    return _token_is_in_set(b, _MODALS) or _token_is_in_set(a, _MODALS)

def _is_preposition_change(b: str, a: str) -> bool:
    b_preps = {t for t in re.findall(r"[\w']+", b.lower()) if t in _PREPOSITIONS}
    a_preps = {t for t in re.findall(r"[\w']+", a.lower()) if t in _PREPOSITIONS}
    return b_preps != a_preps


def _is_auxiliary_change(b: str, a: str) -> bool:
    # if either side contains an auxiliary-form token (be/have/do/modal)
    return _token_is_in_set(b, _AUX_FORMS) or _token_is_in_set(a, _AUX_FORMS)

def _is_pronoun_change(b: str, a: str) -> bool:
    # Detect pronoun swaps or pronoun vs non-pronoun substitutions
    if _token_is_in_set(b, _PRONOUNS) and _token_is_in_set(a, _PRONOUNS):
        # if both contain pronouns, check if they differ
        b_tokens = {t for t in re.findall(r"[\w']+", b.lower()) if t in _PRONOUNS}
        a_tokens = {t for t in re.findall(r"[\w']+", a.lower()) if t in _PRONOUNS}
        return bool(b_tokens ^ a_tokens)  # XOR: true if sets differ
    return (_token_is_in_set(b, _PRONOUNS) and not _token_is_in_set(a, _PRONOUNS)) or (_token_is_in_set(a, _PRONOUNS) and not _token_is_in_set(b, _PRONOUNS))

def _is_possessive_change(b: str, a: str) -> bool:
    bb = (b or "").lower()
    aa = (a or "").lower()
    # possessive pronouns or possessive 's
    if re.search(r"\b(my|your|his|her|its|our|their|mine|yours|hers|ours|theirs)\b", bb) or re.search(r"\b(my|your|his|her|its|our|their|mine|yours|hers|ours|theirs)\b", aa):
        return True
    if bb.endswith("'s") or aa.endswith("'s") or bb.endswith("s'") or aa.endswith("s'"):
        return True
    return False


def _is_conjunction_change(b: str, a: str) -> bool:
    return _token_is_in_set(b, _CONJUNCTIONS) or _token_is_in_set(a, _CONJUNCTIONS)

# ----------------- Guess reason (expanded) -----------------

def _guess_reason(before: str, after: str) -> str:
    import difflib

    b, a = before.strip(), after.strip()
    b_l, a_l = b.lower(), a.lower()

    # 0) Contractions first (handles I’m -> I am etc.)
    if _looks_like_contraction_change(b, a):
        return "apostrophe/contraction"

    # 0.5) Colloquial → standard (must be very early)
    for c, exp in _COLLOQUIAL.items():
        if c in b_l:
            return "colloquial → standard"

    # 1) Capitalization
    if b_l == a_l and b != a:
        return "capitalization"

    # 2) Apostrophe / contraction (fallback token-shape check)
    if (
        b.replace("’", "'").lower().replace("'", "")
        == a.replace("’", "'").lower().replace("'", "")
        and (("'" in b) or ("'" in a) or ("’" in b) or ("’" in a))
        and b != a
    ):
        return "apostrophe/contraction"

    # 3) Specific punctuation
    if re.sub(r"[^\w]", "", b_l) == re.sub(r"[^\w]", "", a_l):
        return _punctuation_label(b, a)

    # QUICK FIX: handle deletion of 'more'/'most' (comparative markers removed)
    if a_l == "" and b_l in ("more", "most"):
        return "comparative/superlative form"

    # 4) Comparative / superlative (must be before deletion/lexical fallbacks)
    if _is_comparative_superlative(b, a):
        return "comparative/superlative form"

    # --- Finer-grained functional word detection ---
    # NOTE: Modals are a subset of auxiliaries; detect modals first for specificity.
    if _is_modal_change(b, a):
        return "modal verb"
    if _is_auxiliary_change(b, a):
        return "auxiliary verb"
    if _is_preposition_change(b, a):
        return "preposition usage"
    if _is_pronoun_change(b, a):
        return "pronoun/person"
    if _is_possessive_change(b, a):
        return "possessive"
    if _is_conjunction_change(b, a):
        return "conjunction usage"

    # 5) Irregular past tense (must precede spelling/lexical)
    # Exact match (correct lemma -> irregular past)
    if b_l in _IRREGULAR_PAST and a_l == _IRREGULAR_PAST[b_l]:
        return "irregular past tense"
    # Handle common misspellings: if 'after' is an irregular past form,
    # check whether 'before' is similar to the corresponding lemma.
    if a_l in set(_IRREGULAR_PAST.values()):
        # find candidate lemmas that map to this past form
        for lemma, past in _IRREGULAR_PAST.items():
            if past == a_l:
                sm = difflib.SequenceMatcher(None, b_l, lemma)
                if sm.ratio() >= 0.5:  # conservative similarity threshold
                    return "irregular past tense"

    # 6) Regular past tense
    if _is_regular_past_ed(b, a):
        return "regular past tense (-ed)"

    # 7) Progressive aspect (-ing)
    if _is_progressive_ing(b, a):
        return "progressive aspect (-ing)"

    # 8) Plural / 3rd-person -s
    if _is_plural_or_3rd_s(b, a):
        return "plural/3rd-person -s"

    # 9) Determiners (trigger only if determiner set actually changes)
    b_dets = {t for t in re.findall(r"[\w']+", b_l) if t in _DETERMINERS}
    a_dets = {t for t in re.findall(r"[\w']+", a_l) if t in _DETERMINERS}
    if b_dets != a_dets:
        return "article/determiner usage"

    # 10) Adverb -ly
    if a_l.endswith("ly") and b_l + "ly" == a_l:
        return "adverb form (-ly)"

    # 11) Spelling / word form (high similarity, short edits)
    if abs(len(b) - len(a)) <= 2:
        sm = difflib.SequenceMatcher(None, b_l, a_l)
        if sm.ratio() >= 0.75:
            return "spelling/word form"

    # 12) Lexical / word choice (single-token semantic swaps)
    b_tokens = re.findall(r"[\w']+", b_l)
    a_tokens = re.findall(r"[\w']+", a_l)
    if len(b_tokens) == 1 and len(a_tokens) == 1:
        sm = difflib.SequenceMatcher(None, b_tokens[0], a_tokens[0])
        if sm.ratio() < 0.6:
            return "lexical/word choice"

    # 13) Default catch-all
    return "grammar/word choice"



def _build_bullets_from_diffs(user_text: str, corrected: str, max_bullets: int = 12) -> list[str]:
    ops = _diff_ops(user_text, corrected)
    bullets = []
    for op, before, after in ops:
        if op == "replace":
            if _normalize_txt(before) == _normalize_txt(after):
                continue
            reason = _guess_reason(before, after)
            bullets.append(f"- **{before} → {after}** — {reason}")
        elif op == "delete":
            reason = _guess_reason(before, "")
            bullets.append(f"- **{before} → (removed)** — {reason}")
        elif op == "insert":
            reason = _guess_reason("", after)
            bullets.append(f"- **(missing) → {after}** — {reason}")
        if len(bullets) >= max_bullets:
            break
    return bullets

# ---------------- POS mapping (coarse, analytics) ----------------

_REASON_TO_POS = {
    "article/determiner usage": "determiner",
    "plural/3rd-person -s": "verb",            # broad backward-compatible bucket
    "irregular past tense": "verb",
    "regular past tense (-ed)": "verb",
    "progressive aspect (-ing)": "verb",
    "comparative/superlative form": "adjective",
    "adverb form (-ly)": "adverb",
    "question mark": "punctuation",
    "period": "punctuation",
    "comma": "punctuation",
    "exclamation": "punctuation",
    "apostrophe/contraction": "contraction",   # more specific than before (keeps compatibility)
    "capitalization": "orthography",
    "punctuation": "punctuation",

    # NEW specific mappings
    "modal verb": "verb.modal",
    "auxiliary verb": "verb.auxiliary",
    "preposition usage": "preposition",
    "pronoun/person": "pronoun",
    "possessive": "possessive",
    "conjunction usage": "conjunction",
    "colloquial → standard": "colloquialism",
    "spelling/word form": "orthography",
    "lexical/word choice": "lexical",
    "grammar/word choice": "grammar",
}

def _reason_to_pos(reason: str) -> str | None:
    return _REASON_TO_POS.get(reason)



def _filter_bullets_with_diffs(bullets: list[str], user_text: str, corrected: str) -> list[str]:
    diffs = _diff_ops(user_text, corrected)

    def matches_any_diff(b):
        m = re.search(r"\*\*(.+?)\s*→\s*(.+?)\*\*", b)
        if not m:
            return False
        before = m.group(1).strip()
        after  = m.group(2).strip()
        for op, d_before, d_after in diffs:
            if _normalize_txt(before) == _normalize_txt(d_before) and _normalize_txt(after) == _normalize_txt(d_after):
                return True
        return False

    return [b for b in bullets if matches_any_diff(b)]

def sanitize_corrections_md(corrections_md: str, user_text: str) -> str:
    """
    (Kept if you ever feed model's own markdown. Currently we build bullets locally.)
    """
    corrected, bullets = _extract_corrected_and_bullets(corrections_md)
    corrected = corrected.strip()
    user_norm = _normalize_txt(user_text)
    corr_norm = _normalize_txt(corrected)

    if corrected and corr_norm == user_norm:
        return "Corrected version:\n" + corrected + "\n\nIssues & fixes:\n- No corrections needed."

    if not corrected:
        corrected = user_text
        corr_norm = user_norm

    bullets = _filter_bullets_with_diffs(bullets, user_text, corrected)
    if not bullets:
        bullets = _build_bullets_from_diffs(user_text, corrected)
    if not bullets:
        return "Corrected version:\n" + corrected + "\n\nIssues & fixes:\n- No corrections needed."

    return "Corrected version:\n" + corrected + "\n\nIssues & fixes:\n" + "\n".join(bullets)

# ---------- NEW: tiny context builder for replies ----------

def _ellipsize(s: str, n: int) -> str:
    s = (s or "").strip().replace("\n", " ")
    return (s[:n-1] + "…") if len(s) > n else s

def _build_brief_context(history: list[dict], max_pairs: int = 6, max_chars: int = 600) -> str:
    if not history:
        return ""
    lines = []
    for turn in history[-(max_pairs*2):]:
        role = turn.get("role","").strip().lower()
        text = _ellipsize(turn.get("text",""), 120)
        if role == "user":
            lines.append(f"U: {text}")
        elif role == "assistant":
            lines.append(f"A: {text}")
    ctx = "\n".join(lines).strip()
    if len(ctx) > max_chars:
        ctx = ctx[-max_chars:]
    return ctx

# ---------------- Routes ----------------

@router.post("/session/start", response_model=StartResponse)
async def session_start(
    body: StartRequest,
    user_id: str = Depends(get_current_user_id),
):
    card = SCENARIOS.get(body.scenario_id) or list(SCENARIOS.values())[0]
    s = new_session(card, body.level, body.strictness)

    # 🔥 CREATE chatAttempt
    ref = (
        db.collection("users")
          .document(user_id)
          .collection("chatAttempts")
          .document(s.id)
    )

    ref.set({
        "sessionId": s.id,
        "scenarioId": card["id"],
        "level": body.level,
        "strictness": body.strictness,
        "startedAt": firestore.SERVER_TIMESTAMP,
        "turns": 0,
        "posSummary": {}
    })

    return StartResponse(session_id=s.id, scenario_card=card)


def _allowed_change_ratio(strictness: float) -> float:
    # Low strictness -> tighter cap; High -> a bit more freedom
    # Ranges roughly 0.15 .. 0.45
    return 0.15 + 0.30 * max(0.0, min(1.0, strictness))

def _allow_sentence_boundary_change(strictness: float) -> bool:
    return strictness >= 0.70

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    # Validate session
    try:
        s = get_session(body.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    user_text = (body.user_text or "").strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty user_text")

    scenario_brief = s.scenario_card.get("brief", "Continue helpfully.")

    # ----- Pass 1: correction (strictness-aware) -----
    try:
        corrected = (await correct_text(user_text, strictness=s.strictness, mode="standard")) or ""
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Ollama correction failed: {e!r}")

    corrected = _clean_corrected_version(corrected)
    corrected_norm = _normalize_txt(corrected)
    user_norm = _normalize_txt(user_text)

    if not corrected_norm:
        corrected = user_text
        corrected_norm = user_norm

    # ---- Post-edit guardrails: diff ratio + sentence lock ----
    ratio_cap = _allowed_change_ratio(s.strictness)
    changed_ratio = _token_diff_ratio(user_text, corrected)
    sentence_changed = (len(_sentences(user_text)) != len(_sentences(corrected)))

    needs_minimal_rerun = (
        (changed_ratio > ratio_cap) or
        (sentence_changed and not _allow_sentence_boundary_change(s.strictness))
    )

    if needs_minimal_rerun:
        # Re-ask with hard clamp (minimal edits)
        try:
            corrected2 = (await correct_text(user_text, strictness=s.strictness, mode="minimal")) or ""
            corrected2 = _clean_corrected_version(corrected2)
            # Accept second result only if it reduces the edit distance or respects sentence count
            changed_ratio2 = _token_diff_ratio(user_text, corrected2)
            sentence_changed2 = (len(_sentences(user_text)) != len(_sentences(corrected2)))
            if (changed_ratio2 <= ratio_cap) and (not sentence_changed2 or _allow_sentence_boundary_change(s.strictness)):
                corrected = corrected2
                corrected_norm = _normalize_txt(corrected2)
        except Exception:
            # If minimal rerun fails, keep first correction but we'll still build bullets deterministically.
            pass

    # Build Corrections MD from diffs (deterministic)
    if corrected_norm == user_norm:
        corrections_md = f"#### Corrected version\n\n{corrected}\n\n#### Issues & Fixes\n\n- No corrections needed."
    else:
        bullets = _build_bullets_from_diffs(user_text, corrected)
        if bullets:
            corrections_md = f"#### Corrected version\n\n{corrected}\n\n#### Issues & Fixes\n\n" + "\n".join(bullets)
        else:
            corrections_md = f"#### Corrected version\n\n{corrected}\n\n#### Issues & Fixes\n\n- No corrections needed."

    # ----- Pass 2: short natural reply (with lightweight memory) -----

    context = _build_brief_context(s.history, max_pairs=6, max_chars=600)
    try:
        reply_text = (await generate_reply(user_text, scenario_brief, context=context)) or ""
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Ollama reply failed: {e!r}")

    if not reply_text.strip():
        reply_text = "Sure—what would you like next?"

    # Save dataset row (optional analytics)
    append_jsonl(s.id, {
        "ts": __import__("time").strftime("%Y-%m-%dT%H:%M:%S"),
        "session_id": s.id,
        "level": s.level,
        "strictness": s.strictness,
        "scenario_id": s.scenario_card.get("id", ""),
        "user_text": user_text,
        "corrected": corrected,
    })

    # Lightweight session memory
    s.history.append({"role": "user", "text": user_text})
    s.history.append({"role": "assistant", "text": reply_text})

    return ChatResponse(corrections_md=corrections_md, bot_reply=reply_text)


@router.post("/session/end", response_model=EndResponse)
async def session_end(
    body: EndRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        s = get_session(body.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    attempt_ref = (
        db.collection("users")
          .document(user_id)
          .collection("chatAttempts")
          .document(s.id)
    )

    # mark session ended only
    attempt_ref.set(
        {"endedAt": firestore.SERVER_TIMESTAMP},
        merge=True
    )

    # cleanup in-memory session
    end_session(s.id)

    report_lines = [
        "# Session Report",
        f"- Session: {s.id}",
        f"- Level: {s.level} | Strictness: {s.strictness}",
        f"- Scenario: {s.scenario_card.get('id','')}",
        "",
        "## Summary",
        "You practiced conversation and received corrections each turn.",
        "",
        "## Suggestions",
        "- Review tense consistency (past simple vs progressive).",
        "- Watch common confusions (its/it's, adverb vs adjective).",
        "- Keep practicing with new scenarios at this level."
    ]

    return EndResponse(
        report_markdown="\n".join(report_lines),
        report_json={
            "session_id": s.id,
            "level": s.level,
            "strictness": s.strictness,
            "scenario_id": s.scenario_card.get("id", "")
        }
    )


# ===== NEW: True streaming SSE =====
@router.post("/stream")
async def chat_stream(
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    body = await request.json()
    session_id = (body.get("session_id") or "").strip()
    user_text = (body.get("user_text") or "").strip()

    try:
        s = get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Invalid session_id")
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty user_text")

    scenario_brief = s.scenario_card.get("brief", "Continue helpfully.")

    context_lines = []
    for turn in s.history[-12:]:
        role = turn["role"][0].upper()
        text = (turn["text"] or "").replace("\n", " ")
        context_lines.append(f"{role}: {text[:120]}")
    context = "\n".join(context_lines)

    async def event_gen():
        corrected_acc = []
        try:
            async for delta in stream_correct_text(user_text, s.strictness, mode="standard"):
                if await request.is_disconnected():
                    return
                corrected_acc.append(delta)
                yield sse("correction_delta", {"text": delta})
        except Exception as e:
            yield sse("error", {"message": f"correction_stream_failed: {e!r}"})

        corrected_full = _clean_corrected_version("".join(corrected_acc).strip()) or user_text
        diffs = _build_bullets_from_diffs(user_text, corrected_full)

        # ---------- POS aggregation ----------
        from collections import Counter
        today = date.today().isoformat()

        pos_counts_this_turn = Counter()

        for bullet in diffs:
            match = re.search(r"—\s*(.+)$", bullet)
            if not match:
                continue
            reason = match.group(1).strip()
            pos = _reason_to_pos(reason)
            if pos:
                pos_counts_this_turn[pos] += 1

        attempt_ref = (
            db.collection("users")
              .document(user_id)
              .collection("chatAttempts")
              .document(session_id)
        )

        # ✅ ALWAYS increment turns
        attempt_ref.set(
            {"turns": Increment(1)},
            merge=True
        )

        # ---------- POS-based updates (only if mistakes exist) ----------
        if pos_counts_this_turn:
            errors_ref = (
                db.collection("users")
                  .document(user_id)
                  .collection("chatErrors")
                  .document("errors")
            )

            errors_update = {}
            attempt_update = {}

            pos_seen_this_turn = set(pos_counts_this_turn.keys())

            for pos, count in pos_counts_this_turn.items():
                # 🔹 GLOBAL totals
                errors_update[f"{pos}.count"] = Increment(count)
                errors_update[f"{pos}.lastSeen"] = today

                # 🔹 SESSION totals
                attempt_update[f"posSummary.{pos}"] = Increment(count)

            # 🔹 GLOBAL turn-based count
            for pos in pos_seen_this_turn:
                errors_update[f"{pos}.chatCount"] = Increment(1)

            errors_ref.set(errors_update, merge=True)
            attempt_ref.set(attempt_update, merge=True)

        # ---------- Corrections payload ----------
        if not diffs:
            corr_md = (
                f"#### Corrected version\n\n{corrected_full}\n\n"
                "#### Issues & Fixes\n\n- No corrections needed."
            )
        else:
            corr_md = (
                f"#### Corrected version\n\n{corrected_full}\n\n"
                "#### Issues & Fixes\n\n" + "\n".join(diffs)
            )

        yield sse("corrections_done", {
            "corrections_md": corr_md,
            "corrected": corrected_full
        })

        reply_acc = []
        try:
            async for delta in stream_reply(user_text, scenario_brief, context=context):
                if await request.is_disconnected():
                    return
                reply_acc.append(delta)
                yield sse("reply_delta", {"text": delta})
        except Exception as e:
            yield sse("error", {"message": f"reply_stream_failed: {e!r}"})

        reply_full = ("".join(reply_acc).strip() or "Sure—what would you like next?")
        yield sse("reply_done", {"text": reply_full})

        append_jsonl(s.id, {
            "ts": __import__("time").strftime("%Y-%m-%dT%H:%M:%S"),
            "session_id": s.id,
            "level": s.level,
            "strictness": s.strictness,
            "scenario_id": s.scenario_card.get("id", ""),
            "user_text": user_text,
            "corrected": corrected_full
        })

        s.history.append({"role": "user", "text": user_text})
        s.history.append({"role": "assistant", "text": reply_full})

    return StreamingResponse(event_gen(), media_type="text/event-stream")



def sse(event: str, data: dict) -> bytes:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")