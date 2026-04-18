import { Link } from "react-router-dom";

export default function UnitList({ units }) {
  if (!units || units.length === 0) return <p>No units yet for this section.</p>;

  return (
    <div className="grid grid--auto-260 slide-up" role="list">
      {units
        .slice()
        .sort((a, b) => {
          // Push recommended quizzes to the front
          if (a.is_recommended && !b.is_recommended) return -1;
          if (!a.is_recommended && b.is_recommended) return 1;
          // Sub-sort by original order
          return (a.order ?? 0) - (b.order ?? 0);
        })
        .map((u) => {
          const isLocked = u.locked;
          
          return (
            <article
              key={u.id}
              className={`card card--p card--stack ${isLocked ? "" : "card--hover"}`}
              role="listitem"
              style={{ opacity: isLocked ? 0.7 : 1, position: "relative" }}
            >
              <div className="card__col">
                <h2 style={{ margin: 0, fontSize: "var(--fs-lg)", display: "flex", gap: "8px", alignItems: "center" }}>
                  {isLocked && "🔒"} {u.title}
                </h2>

                {u.description ? <p style={{ margin: 0, color: "var(--muted)" }}>{u.description}</p> : null}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {u.is_recommended && (
                    <span className="tag" style={{ background: "var(--brand)", color: "var(--bg)", fontWeight: "bold" }}>
                      ⭐ Suggested for You
                    </span>
                  )}
                  <span className="tag">{u.questionCount} question{u.questionCount === 1 ? "" : "s"}</span>
                  {typeof u.passThreshold === "number" ? <span className="tag">Pass: {u.passThreshold}%</span> : null}
                  {isLocked && u.required_xp && (
                    <span className="tag" style={{ border: "1px solid var(--error-color)", color: "var(--error-color)" }}>
                      Requires {u.required_xp} XP
                    </span>
                  )}
                </div>

                <div className="card__spacer" />

                <div style={{ marginTop: 15 }}>
                  {isLocked ? (
                    <button className="btn btn--primary" disabled style={{ background: "var(--muted)", cursor: "not-allowed" }}>
                      Locked
                    </button>
                  ) : (
                    <Link
                      to={`../unit/${u.id}/quiz`}
                      className="btn btn--primary"
                      aria-label={`Start quiz for unit ${u.title}`}
                    >
                      Start Quiz →
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
    </div>
  );
}
