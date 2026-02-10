export default function QuestionCard({ question, selectedChoiceId, onSelect }) {
  if (!question) return null;

  return (
    <section className="card card--p fade-in" style={{ marginBottom: 16 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "#0b1020", border: "1px solid var(--border)", fontWeight: 700
          }}
          aria-hidden
        >
          {question.order}
        </div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>{question.stem}</h2>
      </header>

      <div style={{ display: "grid", gap: 10 }}>
        {question.choices.map((ch, i) => {
          const checked = selectedChoiceId === ch.id;
          const letter = String.fromCharCode(65 + i);
          const id = `${question.id}_${ch.id}`;
          return (
            <label
              key={ch.id}
              htmlFor={id}
              className={`chip ${checked ? "chip--selected" : ""}`}
              style={{ cursor: "pointer" }}
            >
              <input
                id={id}
                type="radio"
                name={question.id}
                value={ch.id}
                checked={!!checked}
                onChange={() => onSelect(question.id, ch.id)}
                style={{ margin: 0 }}
              />
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "#121a2e", border: "1px solid var(--border)", fontSize: 12, fontWeight: 700
                }}
                aria-hidden
              >
                {letter}
              </span>
              <span>{ch.text}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
