export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="progress" aria-label={`Progress ${pct}%`}>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress__text">
        Question {current + 1} of {total} • {pct}%
      </div>
    </div>
  );
}
