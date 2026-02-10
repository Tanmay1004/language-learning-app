import { useEffect, useState } from "react";
import { getSections } from "../api/apiHttp";
import SectionList from "../components/SectionList";

export default function LearnPage() {
  const [data, setData] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getSections()
      .then((res) => alive && setData(res))
      .catch((e) => alive && setErr(e?.message || "Failed to load sections"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="container"><p>Loading sections…</p></div>;
  if (err) return <div className="container"><p role="alert">Error: {String(err)}</p></div>;

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">Learn</h1>
        <p className="page-sub">Pick a section to begin.</p>
      </header>

      <SectionList sections={data.sections} />
    </div>
  );
}
