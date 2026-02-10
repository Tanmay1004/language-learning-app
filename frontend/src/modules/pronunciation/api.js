import { apiFetch } from "../../shared/api/apiClient";

export async function scoreAudio({ file, text }) {
  const fd = new FormData();
  fd.append("file", file, file.name || "recording.webm");
  fd.append("text", text);

  const res = await apiFetch("/api/pronunciation/score", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Server error ${res.status}: ${msg}`);
  }

  return res.json();
}

export async function fetchPracticeSentence() {
  const res = await apiFetch("/api/pronunciation/practice");

  if (!res.ok) {
    throw new Error("Failed to fetch practice sentence");
  }

  return res.json();
}
