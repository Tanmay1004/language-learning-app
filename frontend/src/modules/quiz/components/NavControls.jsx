export default function NavControls({
  canGoBack,
  canGoNext,
  isLast,
  onBack,
  onNext,
  onSubmit
}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:12}}>
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="btn"
        style={{opacity: canGoBack ? 1 : 0.6}}
      >
        ← Back
      </button>

      {!isLast ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="btn btn--primary"
          style={{opacity: canGoNext ? 1 : 0.6}}
        >
          Next →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canGoNext}
          className="btn btn--primary"
          style={{opacity: canGoNext ? 1 : 0.6}}
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
