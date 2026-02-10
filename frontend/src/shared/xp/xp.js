import { fetchUserProfile, syncXPToBackend } from "../api/userApi";

const LS_TOTAL = "xp_total";
const LS_AWARDED = "xp_awarded_attempts";

function notifyXPChanged(detail) {
  try {
    window.dispatchEvent(
      new CustomEvent("xp:changed", { detail })
    );
  } catch {}
}

export function getTotalXP() {
  return parseInt(localStorage.getItem(LS_TOTAL) || "0", 10);
}

export function setTotalXP(val, meta) {
  const safe = Math.max(0, val | 0);
  localStorage.setItem(LS_TOTAL, String(safe));
  notifyXPChanged(meta);
}

export function addXP(amount) {
  const prev = getTotalXP();
  const now = prev + (amount | 0);
  setTotalXP(now, { delta: amount, prev, now });
  return now;
}

function getAwardedSet() {
  try {
    const raw = localStorage.getItem(LS_AWARDED);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveAwardedSet(set) {
  localStorage.setItem(LS_AWARDED, JSON.stringify(Array.from(set)));
}

export function hasAttemptAwarded(attemptId) {
  return getAwardedSet().has(attemptId);
}

export function markAttemptAwarded(attemptId) {
  const s = getAwardedSet();
  s.add(attemptId);
  saveAwardedSet(s);
}

/**
 * Simple, fun XP formula:
 *  - +10 XP per correct answer
 *  - +20 XP for completing the quiz (always)
 *  - +50 XP perfect-score bonus
 */
export function computeXp(result) {
  const { numCorrect, scorePercent } = result;
  let xp = numCorrect * 10 + 20;
  if (scorePercent === 100) xp += 50;
  return xp;
}

/** Levels scale gently with sqrt: level = floor(sqrt(xp/100)) + 1 */
export function levelFromXP(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function levelBounds(level) {
  const start = (level - 1) ** 2 * 100;
  const end = level ** 2 * 100;
  return { start, end, span: end - start };
}

export function levelProgress(totalXP) {
  const lvl = levelFromXP(totalXP);
  const { start, end, span } = levelBounds(lvl);
  const into = Math.max(0, totalXP - start);
  const pct = span > 0 ? Math.round((into / span) * 100) : 100;
  return { level: lvl, start, end, into, span, pct };
}


/**
 * Bidirectional XP sync between localStorage and Firestore.
 * Rule: whichever XP is higher wins.
 * 
 * Call this:
 *  - after login
 *  - on app boot when user is authenticated
 */
export async function syncXPBidirectional() {
  const localXP = getTotalXP();

  const remote = await fetchUserProfile();
  const remoteXP = remote?.totalXP ?? 0;

  const finalXP = Math.max(localXP, remoteXP);
  const finalLevel = levelFromXP(finalXP);

  // 1️⃣ Sync localStorage if Firestore had more
  if (finalXP !== localXP) {
    setTotalXP(finalXP, {
      prev: localXP,
      now: finalXP,
      delta: finalXP - localXP,
      source: "sync",
    });
  }

  // 2️⃣ Sync Firestore if localStorage had more
  if (finalXP !== remoteXP) {
    await syncXPToBackend({
      delta: finalXP - remoteXP,
      source: "sync",
    });
  }

  return {
    totalXP: finalXP,
    level: finalLevel,
    streak: remote?.streak ?? 0, // backend remains authoritative
  };
}
