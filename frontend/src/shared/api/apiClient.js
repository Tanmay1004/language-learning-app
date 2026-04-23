import { auth } from "../../auth/firebase";

const API_BASE = "http://localhost:8000"; // backend origin

export async function apiFetch(path, options = {}) {
  // Wait for Firebase to finish its initial auth check
  // before assuming the user is not logged in.
  await auth.authStateReady();

  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}
