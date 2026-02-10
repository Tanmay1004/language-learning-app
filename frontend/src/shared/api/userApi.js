import { apiFetch } from "./apiClient";

export async function syncXPToBackend({ delta, attemptId, source }) {
  const res = await apiFetch("/api/users/xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      delta,
      attemptId,
      source, // "quiz" for now
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to sync XP");
  }

  return res.json();
}

export async function fetchUserProfile() {
  const res = await apiFetch("/api/users/me");
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}