import { apiFetch } from "../../../shared/api/apiClient";

async function j(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

/* Sections */

export async function getSections() {
  return j(await apiFetch(`/api/quiz/sections`));
}

export async function getUnits(sectionId) {
  return j(await apiFetch(`/api/quiz/section/${sectionId}`));
}

/* Quiz */

export async function getQuiz(unitId) {
  return j(await apiFetch(`/api/quiz/unit/${unitId}/quiz`));
}

/* Attempts */

export async function createAttempt(unitId) {
  return j(
    await apiFetch(`/api/quiz/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId }),
    })
  );
}

export async function saveAnswer(attemptId, { questionId, choiceId }) {
  return j(
    await apiFetch(`/api/quiz/attempt/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, choiceId }),
    })
  );
}

export async function submitAttempt(attemptId) {
  return j(
    await apiFetch(`/api/quiz/attempt/${attemptId}/submit`, {
      method: "POST",
    })
  );
}

export async function getAttempt(attemptId) {
  return j(await apiFetch(`/api/quiz/attempt/${attemptId}`));
}
