import React, { useRef, useState } from "react";
import { scoreAudio, fetchPracticeSentence } from "./api";
import "./styles.css";

export default function PronunciationPage() {
  // Inputs
  const [reference, setReference] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  // Recorder
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);

  // UI state
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  // Refs
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // ---------- Reset recording ----------
  function hardResetRecording() {
    try {
      if (mediaRecorder) {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
        mediaRecorder.stream?.getTracks?.().forEach((t) => t.stop());
      }
    } catch { }
    setRecording(false);
    setMediaRecorder(null);
    setRecordedBlob(null);
    chunksRef.current = [];
  }

  // ---------- Start / Stop recording ----------
  async function startRecording() {
    setError("");
    setResult(null);
    // mutually exclusive: clear file selection
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch {
      setError("Could not access microphone. Please allow mic permission.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
    }
  }

  // ---------- File chooser ----------
  function onChooseFile(e) {
    const file = e.target.files?.[0] || null;
    if (file) {
      // mutually exclusive: kill recording state
      hardResetRecording();
      setRecordedBlob(null);
    }
    setUploadFile(file);
    setResult(null);
    setError("");
  }

  // ---------- Submit ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!reference.trim()) {
      setError("Please enter the reference text.");
      return;
    }

    let fileToSend = null;
    if (recordedBlob) {
      fileToSend = new File([recordedBlob], "recording.webm", {
        type: recordedBlob.type || "audio/webm",
      });
    } else if (uploadFile) {
      fileToSend = uploadFile;
    } else {
      setError("Please upload a file or record audio.");
      return;
    }

    try {
      setBusy(true);
      const data = await scoreAudio({ file: fileToSend, text: reference });
      setResult(data);
      setShowRaw(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // ---------- Reset ----------
  function resetInputs() {
    setReference("");
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    hardResetRecording();
    setResult(null);
    setError("");
    setShowRaw(false);
  }

  // ---------- UI helpers ----------
  const overallColor = (n) => (n >= 90 ? "#16a34a" : n >= 75 ? "#2563eb" : "#dc2626");
  const statusChip = (s) =>
    s === "correct" ? "chip chip-green" : s === "substitution" ? "chip chip-amber" : "chip chip-red";
  const confUnderline = (n) => (n >= 80 ? "underline-strong" : n >= 50 ? "underline-mid" : "underline-weak");
  const punctStatus = (s) => (s === "ok" ? "pill pill-neutral" : "pill pill-amber");

  // Compute nice durations per word
  const wordDuration = (w) =>
    w?.start != null && w?.end != null ? Math.max(0, (w.end - w.start)).toFixed(2) : "—";

  // Penalty breakdown formatter
  const penaltyLine = (label, n) => (
    <div className="kv">
      <span>{label}</span>
      <span className="kv-value">−{n}</span>
    </div>
  );

  return (
    <div className="pronunciation-root">
      <div className="container">
        <header>
          <h1>Pronunciation Scoring</h1>
          <p className="subtitle">Type a reference. Upload or record audio. Get detailed scoring.</p>
        </header>

        <section className="card">
          <form onSubmit={handleSubmit}>
            <label className="label">Reference text</label>
            <textarea
              className="text-input"
              rows={2}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Type the sentence the learner should read"
            />

            <div className="row">
              <div className="col">
                <label className="label">Upload audio file</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={onChooseFile}
                  disabled={recording}
                />
                {uploadFile && <small className="muted">Selected: {uploadFile.name}</small>}
              </div>

              <div className="col">
                <label className="label">Or record now</label>
                {!recording ? (
                  <button type="button" className="btn" onClick={startRecording}>
                    🎙️ Start recording
                  </button>
                ) : (
                  <button type="button" className="btn btn-stop" onClick={stopRecording}>
                    ⏹ Stop
                  </button>
                )}
                {recordedBlob && (
                  <div className="preview-audio">
                    <audio controls src={URL.createObjectURL(recordedBlob)} />
                    <button type="button" className="link" onClick={() => setRecordedBlob(null)}>
                      Clear recording
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Scoring..." : "Score"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetInputs} disabled={busy}>
                Reset
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  try {
                    // 1️⃣ Reset everything (same as Reset button)
                    resetInputs();

                    // 2️⃣ Fetch practice sentence
                    const data = await fetchPracticeSentence();

                    if (!data.sentence) {
                      setError("No weak words yet. You're doing great! 🎉");
                      return;
                    }

                    // 3️⃣ Inject sentence into reference box
                    setReference(data.sentence.sentence);
                    setError("");
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                🎯 Practice weak word
              </button>

            </div>

            {error && <div className="error">{error}</div>}
          </form>
        </section>

        {result && (
          <>
            {/* QUICK GLANCE */}
            <section className="card">
              <div className="scorebar" style={{ borderColor: overallColor(result.overall) }}>
                <div className="score">
                  <span className="score-num" style={{ color: overallColor(result.overall) }}>
                    {result.overall}
                  </span>
                  <span className="score-label">{result.label}</span>
                </div>
                <div className="meta">
                  <div>
                    <b>Reference:</b> {result.reference}
                  </div>
                  <div>
                    <b>Heard:</b> {result.hypothesis || <i>(no speech)</i>}
                  </div>
                </div>
              </div>

              <h3>Per-word feedback</h3>
              <div className="chips">
                {result.reference_tokens?.map((t, idx) => (
                  <div key={idx} className={statusChip(t.status)}>
                    <span>{t.ref}</span>
                    {t.status === "substitution" && t.heard && <span className="muted"> (heard: {t.heard})</span>}
                    <span className={`underline ${confUnderline(t.confidence_0_100)}`} />
                  </div>
                ))}
              </div>
            </section>

            {/* SCORE BREAKDOWN */}
            <section className="card">
              <h3>Score breakdown</h3>
              <div className="grid-2">
                <div className="box">
                  <div className="kv">
                    <span>Base accuracy (from words)</span>
                    <span className="kv-value">{result.base_overall_before_fluency ?? "—"}</span>
                  </div>
                  {penaltyLine("Fluency penalty", result.fluency?.penalty_points ?? 0)}
                  {penaltyLine("Punctuation penalty", result.punctuation_penalty_points ?? 0)}
                  <div className="divider" />
                  <div className="kv total">
                    <span>Final score</span>
                    <span className="kv-value" style={{ color: overallColor(result.overall) }}>
                      {result.overall}
                    </span>
                  </div>
                </div>

                <div className="box">
                  <div className="kv">
                    <span>Longest pause</span>
                    <span className="kv-value">{result.fluency?.max_pause_s ?? 0}s</span>
                  </div>
                  <div className="kv">
                    <span>Long pauses count</span>
                    <span className="kv-value">{result.fluency?.pause_count ?? 0}</span>
                  </div>
                  {result.hints?.length ? (
                    <>
                      <div className="divider" />
                      <div className="kv"><span>Hints</span></div>
                      <ul className="hints">
                        {result.hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
            </section>

            {/* WORD ALIGNMENT TABLE */}
            <section className="card">
              <h3>Word alignment details</h3>
              <div className="table">
                <div className="tr th">
                  <div>Reference</div>
                  <div>Status</div>
                  <div>Heard</div>
                  <div>Confidence</div>
                  <div>Start (s)</div>
                  <div>End (s)</div>
                  <div>Duration (s)</div>
                </div>
                {result.reference_tokens?.map((t, i) => (
                  <div className="tr" key={i}>
                    <div>{t.ref}</div>
                    <div className={t.status === "correct" ? "tag tag-green" : t.status === "substitution" ? "tag tag-amber" : "tag tag-red"}>
                      {t.status}
                    </div>
                    <div>{t.heard ?? "—"}</div>
                    <div>{t.confidence_0_100 ?? 0}</div>
                    <div>{t.start ?? "—"}</div>
                    <div>{t.end ?? "—"}</div>
                    <div>{wordDuration(t)}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* INSERTIONS */}
            <section className="card">
              <h3>Extra words detected (insertions)</h3>
              {result.insertions?.length ? (
                <div className="table">
                  <div className="tr th">
                    <div>Word</div>
                    <div>Confidence</div>
                    <div>Start (s)</div>
                    <div>End (s)</div>
                    <div>Duration (s)</div>
                  </div>
                  {result.insertions.map((w, i) => (
                    <div className="tr" key={i}>
                      <div>{w.heard}</div>
                      <div>{w.confidence_0_100 ?? 0}</div>
                      <div>{w.start ?? "—"}</div>
                      <div>{w.end ?? "—"}</div>
                      <div>{w?.start != null && w?.end != null ? (w.end - w.start).toFixed(2) : "—"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="box muted">No extra words detected.</div>
              )}
            </section>

            {/* PUNCTUATION */}
            <section className="card">
              <h3>Punctuation pause analysis</h3>
              {result.punctuation?.length ? (
                <div className="table">
                  <div className="tr th">
                    <div>Mark</div>
                    <div>After</div>
                    <div>Actual pause (ms)</div>
                    <div>Expected (ms)</div>
                    <div>Status</div>
                  </div>
                  {result.punctuation.map((p, i) => (
                    <div className="tr" key={i}>
                      <div>{p.mark}</div>
                      <div>{p.after_ref}</div>
                      <div>{p.actual_pause_ms ?? "—"}</div>
                      <div>{p.expected_pause_ms ?? "—"}</div>
                      <div className={p.status === "ok" ? "tag tag-green" : "tag tag-amber"}>{p.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="box muted">No punctuation to evaluate.</div>
              )}
            </section>

            {/* RAW JSON (debug) */}
            <section className="card">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Raw response (debug)</h3>
                <button className="btn" type="button" onClick={() => setShowRaw((s) => !s)}>
                  {showRaw ? "Hide" : "Show"}
                </button>
              </div>
              {showRaw && (
                <pre className="pre">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </section>
          </>
        )}

        <footer className="footer">
          <span className="muted">All processing is done via Vosk. Audio samples will be sent to the server.</span>
        </footer>
      </div>
    </div>
  );
}
