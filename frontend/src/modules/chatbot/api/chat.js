// Uses your existing axios client for non-stream calls,
// adds a fetch-based SSE helper for true streaming.

import { api } from "./client";
import { auth } from "../../../auth/firebase";

const API_BASE = api.defaults.baseURL || "http://localhost:8000/api/chat";

// ✅ FIX: attach Firebase token for protected endpoint
export const startSession = async (payload) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  return api.post("/session/start", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const chatTurn = (payload) => api.post("/chat", payload); // fallback / legacy
export const endSession = async (payload) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  return api.post("/session/end", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


/**
 * True streaming via SSE over POST fetch to /chat/stream.
 * onEvent is called with { type, data } where type is one of:
 *  - "correction_delta"   data: { text }
 *  - "corrections_done"  data: { corrections_md, corrected }
 *  - "reply_delta"       data: { text }
 *  - "reply_done"        data: { text }
 *  - "error"             data: { message }
 */
export async function chatTurnStream(payload, onEvent) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    // fallback: non-streaming
    const { data } = await chatTurn(payload);
    onEvent?.({
      type: "corrections_done",
      data: { corrections_md: data.corrections_md, corrected: "" },
    });

    // simulate deltas for reply
    const txt = data.bot_reply || "";
    for (let i = 0; i < txt.length; i += Math.max(1, Math.floor(txt.length / 32))) {
      onEvent?.({ type: "reply_delta", data: { text: txt.slice(i, i + 1) } });
    }
    onEvent?.({ type: "reply_done", data: { text: txt } });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Parse SSE frames
    const frames = buffer.split("\n\n");
    buffer = frames.pop() || "";

    for (const frame of frames) {
      const lines = frame.split("\n");
      let event = "";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!event || !data) continue;
      try {
        const parsed = JSON.parse(data);
        onEvent?.({ type: event, data: parsed });
      } catch {
        onEvent?.({ type: "error", data: { message: "bad_sse_json" } });
      }
    }
  }
}
