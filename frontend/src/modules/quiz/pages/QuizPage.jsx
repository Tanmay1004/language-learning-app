import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getQuiz, createAttempt, saveAnswer, submitAttempt } from "../api/apiHttp";
import QuestionCard from "../components/QuestionCard";
import NavControls from "../components/NavControls";
import ProgressBar from "../components/ProgressBar";

export default function QuizPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    async function boot() {
      try {
        setLoading(true);
        const q = await getQuiz(unitId);
        if (!alive) return;
        setQuiz(q);
        const { attemptId } = await createAttempt(unitId);
        if (!alive) return;
        setAttemptId(attemptId);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load quiz");
      } finally {
        if (alive) setLoading(false);
      }
    }
    boot();
    return () => { alive = false; };
  }, [unitId]);

  const total = quiz?.questions?.length || 0;
  const question = quiz?.questions?.[currentIndex];

  const unansweredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce(
      (acc, q) => acc + (selections[q.id] ? 0 : 1),
      0
    );
  }, [quiz, selections]);

  const selectChoice = useCallback(async (questionId, choiceId) => {
    setSelections((prev) => ({ ...prev, [questionId]: choiceId }));
    if (attemptId) {
      try {
        await saveAnswer(attemptId, { questionId, choiceId });
      } catch (e) {
        console.warn("saveAnswer failed:", e);
      }
    }
  }, [attemptId]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, total]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    if (unansweredCount > 0) {
      const ok = window.confirm(`${unansweredCount} unanswered. Submit anyway?`);
      if (!ok) return;
    }
    try {
      const result = await submitAttempt(attemptId);
      navigate(`../results/${attemptId}`, { state: { result } });
    } catch (e) {
      alert("Submit failed: " + (e?.message || "Unknown error"));
    }
  }, [attemptId, unansweredCount, navigate]);

  // Global hotkeys
  useEffect(() => {
    function onKeyDown(e) {
      const target = e.target;
      const skip = target.closest?.(
        "input, textarea, select, button, a, [role='button']"
      );
      if (skip) return;
      if (!quiz || !question) return;

      const choices = question.choices || [];
      const selectedId = selections[question.id] || null;
      const idx = choices.findIndex((c) => c.id === selectedId);

      if (e.key === "ArrowDown") {
        const next = idx === -1 ? choices[0] : choices[(idx + 1) % choices.length];
        if (next) selectChoice(question.id, next.id);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        const prev = idx === -1 ? choices[0] : choices[(idx - 1 + choices.length) % choices.length];
        if (prev) selectChoice(question.id, prev.id);
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (currentIndex === total - 1) handleSubmit();
        else handleNext();
        e.preventDefault();
      } else if (e.key === "Escape") {
        handleBack();
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    quiz,
    question,
    selections,
    selectChoice,
    handleNext,
    handleBack,
    handleSubmit,
    currentIndex,
    total
  ]);

  if (loading) return <div className="page"><p>Loading quiz…</p></div>;
  if (err) return (
    <div className="page">
      <p role="alert">Error: {String(err)}</p>
      <Link to=".." className="breadcrumb">Back to Sections</Link>
    </div>
  );

  const selectedChoiceId = question ? selections[question.id] : null;
  const canGoBack = currentIndex > 0;
  const isLast = currentIndex === total - 1;

  const sectionId =
    unitId.startsWith("unit_articles") ? "sec_articles"
    : unitId.startsWith("unit_nouns") ? "sec_nouns"
    : null;

  const statusPill = selectedChoiceId
    ? <span className="tag tag--answered">Answered</span>
    : <span className="tag tag--unanswered">Unanswered</span>;

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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h1 className="page-title" style={{ margin: 0 }}>
            {quiz?.unit?.title || "Quiz"}
          </h1>
          {statusPill}
        </div>

        <ProgressBar current={currentIndex} total={total} />
      </header>

      <QuestionCard
        question={question}
        selectedChoiceId={selectedChoiceId}
        onSelect={selectChoice}
      />

      <NavControls
        canGoBack={canGoBack}
        canGoNext={true}
        isLast={isLast}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
