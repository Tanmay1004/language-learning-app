import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { getAttempt } from "../api/apiHttp";
import ResultsSummary from "../components/ResultsSummary";
import { syncXPToBackend } from "../../../shared/api/userApi";
import {
  computeXp,
  getTotalXP,
  addXP,
  hasAttemptAwarded,
  markAttemptAwarded,
  levelProgress,
} from "../../../shared/xp/xp";

export default function ResultsPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [err, setErr] = useState(null);

  // XP state (for summary panel only)
  const [xpEarned, setXpEarned] = useState(0);
  const [totalXP, setTotalXP] = useState(getTotalXP());

  // Load result if we didn't navigate with state
  useEffect(() => {
    let alive = true;

    async function fetchResult() {
      if (result) return;
      try {
        setLoading(true);
        const res = await getAttempt(attemptId);
        if (!alive) return;
        setResult(res);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load results");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchResult();
    return () => {
      alive = false;
    };
  }, [attemptId, result]);

  // Award XP once per attempt (animations handled globally)
  useEffect(() => {
    if (!result) return;
    if (!("numCorrect" in result) || !("numTotal" in result)) return;

    const earned = computeXp(result);

    // Already awarded → just sync display
    if (hasAttemptAwarded(result.attemptId)) {
      setXpEarned(earned);
      setTotalXP(getTotalXP());
      return;
    }

    setXpEarned(earned);
    const newTotal = addXP(earned);
    setTotalXP(newTotal);
    markAttemptAwarded(result.attemptId);

    // 🔥 Backend sync + live streak update
    syncXPToBackend({
      delta: earned,
      attemptId: result.attemptId,
      source: "quiz",
    })
      .then((res) => {
        window.dispatchEvent(
          new CustomEvent("streak:changed", { detail: res.streak })
        );
      })
      .catch((err) => {
        console.error("XP sync failed:", err);
      });
  }, [result]);


  if (loading) {
    return (
      <div className="page">
        <p>Loading results…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <p role="alert">Error: {String(err)}</p>
        <button className="btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // Infer section for the Back link
  const sectionId =
    result.unitId?.startsWith("unit_articles")
      ? "sec_articles"
      : result.unitId?.startsWith("unit_nouns")
        ? "sec_nouns"
        : null;

  const prog = levelProgress(totalXP);

  return (
    <div className="page fade-in">
      <header className="page-header">
        <div style={{ marginBottom: 8 }}>
          {sectionId ? (
            <Link to={`../section/${sectionId}`} className="breadcrumb">
              ← Back to Section
            </Link>
          ) : (
            <Link to=".." className="breadcrumb">
              ← Back
            </Link>
          )}
        </div>
        <h1 className="page-title">Quiz Results</h1>
        <p className="page-sub">Review your answers and see your XP.</p>
      </header>

      <ResultsSummary result={result} />

      {/* Level / XP panel */}
      <section className="card card--p" style={{ marginBottom: 16 }}>
        <div className="level">
          <div className="level__row">
            <div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--muted)" }}>
                Level
              </div>
              <div className="level__num">{prog.level}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--muted)" }}>
                Total XP
              </div>
              <div style={{ fontWeight: 700 }}>{totalXP}</div>
              {xpEarned > 0 && (
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--muted)" }}>
                  Earned: +{xpEarned}
                </div>
              )}
            </div>
          </div>

          <div className="level__bar">
            <div
              className="level__fill"
              style={{ width: `${prog.pct}%` }}
            />
          </div>

          <div className="level__row">
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--muted)" }}>
              {prog.into} / {prog.span} XP to next level
            </span>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--muted)" }}>
              {prog.pct}%
            </span>
          </div>
        </div>
      </section>

      {/* Review list */}
      <section className="card card--p" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Review</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {result.items.map((it, idx) => (
            <li
              key={it.questionId}
              className={`card card--p review-item ${it.isCorrect ? "review-item--ok" : "review-item--bad"
                }`}
              style={{ padding: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  className={`tag ${it.isCorrect ? "tag--correct" : "tag--incorrect"
                    }`}
                >
                  {it.isCorrect ? "Correct" : "Incorrect"}
                </span>
                <span
                  style={{
                    color: "var(--muted)",
                    fontSize: "var(--fs-xs)",
                  }}
                >
                  Q{idx + 1}
                </span>
              </div>

              <p style={{ margin: "4px 0 6px 0" }}>{it.stem}</p>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  color: "var(--muted)",
                }}
              >
                <span>
                  Your answer:{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {it.yourChoiceText}
                  </strong>
                </span>
                <span>
                  Correct:{" "}
                  <strong style={{ color: "var(--text)" }}>
                    {it.correctChoiceText}
                  </strong>
                </span>
              </div>

              {it.explanation && (
                <p
                  style={{
                    margin: "8px 0 0 0",
                    color: "var(--muted)",
                  }}
                >
                  {it.explanation}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          to={`../unit/${result.unitId}/quiz`}
          className="btn btn--primary"
        >
          Retry Quiz
        </Link>
        {sectionId && (
          <Link to={`../section/${sectionId}`} className="btn">
            Back to Section
          </Link>
        )}
        <Link to=".." className="btn">
          Back to Sections
        </Link>
      </div>
    </div>
  );
}