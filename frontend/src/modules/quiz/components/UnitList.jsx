import { Link } from "react-router-dom";

export default function UnitList({ units }) {
  if (!units || units.length === 0) return <p>No units yet for this section.</p>;

  return (
    <div className="grid grid--auto-260 slide-up" role="list">
      {units
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((u) => (
          <article
            key={u.id}
            className="card card--p card--hover card--stack"
            role="listitem"
          >
            <div className="card__col">
              <h2 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>{u.title}</h2>

              {u.description ? <p style={{ margin: 0, color: "var(--muted)" }}>{u.description}</p> : null}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <span className="tag">{u.questionCount} question{u.questionCount === 1 ? "" : "s"}</span>
                {typeof u.passThreshold === "number" ? <span className="tag">Pass: {u.passThreshold}%</span> : null}
              </div>

              <div className="card__spacer" />

              <div style={{ marginTop: 10 }}>
                <Link
                  to={`../unit/${u.id}/quiz`}
                  className="btn btn--primary"
                  aria-label={`Start quiz for unit ${u.title}`}
                >
                  Start Quiz →
                </Link>
              </div>
            </div>
          </article>
        ))}
    </div>
  );
}
