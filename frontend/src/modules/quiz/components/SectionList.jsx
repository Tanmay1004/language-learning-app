import { Link } from "react-router-dom";

export default function SectionList({ sections }) {
  if (!sections || sections.length === 0) return <p>No sections available yet.</p>;

  return (
    <div className="grid grid--auto-240 slide-up" role="list">
      {sections
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => (
          <article key={s.id} className="card card--p card--hover card--stack" role="listitem">
            <div className="card__col">
              <h2 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>{s.title}</h2>
              {s.description ? (
                <p style={{ margin: 0, color: "var(--muted)" }}>{s.description}</p>
              ) : null}

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span className="tag">
                  {s.unitCount ?? 0} unit{s.unitCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="card__spacer" />

              <div style={{ marginTop: 8 }}>
                <Link
                  to={`section/${s.id}`}
                  className="btn btn--subtle"
                  aria-label={`Open section ${s.title}`}
                >
                  Open →
                </Link>
              </div>
            </div>
          </article>
        ))}
    </div>
  );
}
