import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUnits } from "../api/apiHttp";
import UnitList from "../components/UnitList";

export default function SectionPage() {
  const { sectionId } = useParams();
  const [data, setData] = useState({ section: null, units: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getUnits(sectionId)
      .then((res) => alive && setData(res))
      .catch((e) => alive && setErr(e?.message || "Failed to load units"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [sectionId]);

  if (loading) return <div className="container"><p>Loading units…</p></div>;
  if (err) return <div className="container"><p role="alert">Error: {String(err)}</p></div>;

  return (
    <div className="container fade-in">
      <header className="page-header">
        <div style={{ marginBottom: 8 }}>
          <Link to=".." className="breadcrumb">← All Sections</Link>
        </div>
        <h1 className="page-title">{data.section?.title || "Section"}</h1>
        {data.section?.description && (
          <p className="page-sub">{data.section.description}</p>
        )}
      </header>

      <UnitList units={data.units} />
    </div>
  );
}
