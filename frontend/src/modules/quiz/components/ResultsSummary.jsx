export default function ResultsSummary({ result }) {
  if (!result) return null;
  const { numCorrect, numTotal, scorePercent } = result;

  return (
    <div className="card card--p fade-in" style={{marginBottom:16}}>
      <h1 style={{margin:"0 0 6px 0"}}>Your Results</h1>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div className="score">{scorePercent}%</div>
        <p style={{margin:0,color:"var(--muted)"}}>
          Correct: <strong style={{color:"var(--text)"}}>{numCorrect}</strong> / {numTotal}
        </p>
      </div>
    </div>
  );
}
