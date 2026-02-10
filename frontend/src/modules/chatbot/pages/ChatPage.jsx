// Streaming UI with 65/35 layout, sticky corrections panel, and no duplicate corrections under bubbles.

import { useEffect, useMemo, useRef, useState } from "react";
import { startSession, endSession, chatTurnStream } from "../api/chat";
import ReactMarkdown from "react-markdown";


export default function ChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [level, setLevel] = useState("B1");
  const [strictness, setStrictness] = useState(0.6);
  const [scenario, setScenario] = useState("drive_through_A2");
  const [userText, setUserText] = useState("");

  const [turns, setTurns] = useState([]); // {role, text}
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveReply, setLiveReply] = useState("");
  const [liveCorrections, setLiveCorrections] = useState(""); // full markdown, lands when corrections_done

  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, liveReply]);

  const lastCorrections = useMemo(() => liveCorrections, [liveCorrections]);

  const onStart = async () => {
    const { data } = await startSession({ level, strictness, scenario_id: scenario });
    setSessionId(data.session_id);
    setTurns([{ role: "system", text: `Session started (${data.scenario_card.id})` }]);
    setLiveReply(""); setLiveCorrections("");
    inputRef.current?.focus();
  };

  const onSend = async () => {
    if (!sessionId || !userText.trim() || isStreaming) return;

    const msg = userText.trim();
    setUserText("");
    setTurns((t) => [...t, { role: "user", text: msg }]);
    setIsStreaming(true);
    setLiveReply(""); setLiveCorrections("");

    await chatTurnStream(
      { session_id: sessionId, user_text: msg },
      ({ type, data }) => {
        if (type === "correction_delta") {
          // (Optional) Show corrected text live in side panel header if you want; we keep it minimal.
        } else if (type === "corrections_done") {
          setLiveCorrections(data.corrections_md || "");
        } else if (type === "reply_delta") {
          setLiveReply((prev) => prev + (data.text || ""));
        } else if (type === "reply_done") {
          setTurns((t) => [...t, { role: "assistant", text: data.text || "" }]);
          setLiveReply("");
          setIsStreaming(false);
        } else if (type === "error") {
          setTurns((t) => [...t, { role: "system", text: `Error: ${data?.message || "stream error"}` }]);
          setIsStreaming(false);
        }
      }
    );
  };

  const onEnd = async () => {
    if (!sessionId || isStreaming) return;
    const { data } = await endSession({ session_id: sessionId });
    setTurns((t) => [...t, { role: "system", text: "Session ended.\n\n" + data.report_markdown }]);
    setSessionId(""); setLiveReply(""); setLiveCorrections("");
  };

  return (
    <div className="app-shell chatbot-root">

      <header className="topbar">
        <div className="title">Conversational Chatbot <span className="tag">LLM-only</span></div>
        <div className="controls">
          <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={!!sessionId} title="Level">
            {["A1","A2","B1","B2","C1","C2"].map((l) => <option key={l}>{l}</option>)}
          </select>
          <input type="number" step="0.1" min="0" max="1" value={strictness}
            onChange={(e) => setStrictness(Number(e.target.value))} disabled={!!sessionId} title="Strictness (0-1)" />
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            disabled={!!sessionId}
            title="Scenario"
          >
            <option value="drive_through_A2">Drive-through (A2)</option>
            <option value="mall_help_B1">Mall Help (B1)</option>
            <option value="airport_help_A2">Airport Help Desk (A2)</option>
            <option value="hotel_reception_A2">Hotel Reception (A2)</option>
            <option value="restaurant_table_service_A2">Restaurant – Table Service (A2)</option>
            <option value="doctor_appointment_B1">Doctor’s Appointment (B1)</option>
            <option value="job_interview_B2">Job Interview (B2)</option>
          </select>
          {!sessionId ? (
            <button className="btn primary" onClick={onStart}>Start</button>
          ) : (
            <button className="btn" onClick={onEnd} disabled={isStreaming}>End</button>
          )}
        </div>
      </header>

      <div className="grid">
        {/* Chat 65% */}
        <section className="chat-pane">
          <div ref={chatBoxRef} className="chat-window">
            {turns.map((t, i) => <ChatBubble key={i} role={t.role} text={t.text} />)}
            {isStreaming && <ChatBubble role="assistant" text={liveReply || "…"} streaming />}
          </div>

          <div className="composer">
            <textarea
              ref={inputRef}
              rows={3}
              placeholder="Type your message…"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              disabled={!sessionId || isStreaming}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            />
            <div className="composer-actions">
              <button className="btn primary" onClick={onSend} disabled={!sessionId || !userText.trim() || isStreaming}>
                {isStreaming ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </section>

        {/* Corrections 35% (sticky) */}
        <aside className="side-pane">
          <div className="side-inner">
            <h3>Last Turn Corrections</h3>
            {isStreaming && !lastCorrections && (
              <div className="skeleton">
                <div className="sk-line" style={{ width: "70%" }} />
                <div className="sk-line" style={{ width: "95%" }} />
                <div className="sk-line" style={{ width: "85%" }} />
                <div className="sk-line" style={{ width: "92%" }} />
              </div>
            )}
            {!!lastCorrections && (
              <div className="corrections">
                <ReactMarkdown>{lastCorrections}</ReactMarkdown>
              </div>
            )}
            {!isStreaming && !lastCorrections && <div className="muted">No corrections yet.</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChatBubble({ role, text, streaming = false }) {
  const cls = role === "user" ? "user" : role === "assistant" ? "assistant" : "system";
  return (
    <div className={`bubble ${cls} ${streaming ? "streaming" : ""}`}>
      <div className="bubble-header"><span className="role">{role.toUpperCase()}</span></div>
      <div className="bubble-text">{text}</div>
    </div>
  );
}
