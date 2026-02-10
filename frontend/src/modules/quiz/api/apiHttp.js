const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api/quiz";

async function j(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

/* Sections */

export async function getSections() {
  return j(await fetch(`${API}/sections`));
}

export async function getUnits(sectionId) {
  return j(await fetch(`${API}/section/${sectionId}`));
}

/* Quiz */

export async function getQuiz(unitId) {
  return j(await fetch(`${API}/unit/${unitId}/quiz`));
}

/* Attempts */

export async function createAttempt(unitId) {
  return j(
    await fetch(`${API}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId }),
    })
  );
}

export async function saveAnswer(attemptId, { questionId, choiceId }) {
  return j(
    await fetch(`${API}/attempt/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, choiceId }),
    })
  );
}

export async function submitAttempt(attemptId) {
  return j(
    await fetch(`${API}/attempt/${attemptId}/submit`, {
      method: "POST",
    })
  );
}

export async function getAttempt(attemptId) {
  return j(await fetch(`${API}/attempt/${attemptId}`));
}
