import Link from 'next/link';

const LOOP = ['Assess', 'Identify Gaps', 'Learn on iGOT', 'AI Quiz', 'Measure Improvement'];

export default function HomePage() {
  return (
    <div>
      <section className="card hero">
        <p className="eyebrow">MoSPI × iGOT Karmayogi</p>
        <h1>Competency Intelligence for Government Training</h1>
        <p className="lede">
          Map every officer’s role to required competencies, diagnose gaps with a real assessment,
          close them with a personalised iGOT learning path, and verify improvement with
          source-grounded AI quizzes built from your own training material.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-lg" href="/assess">Start Assessment</Link>
          <Link className="btn btn-lg" href="/gaps">View Competency Gaps</Link>
          <Link className="btn btn-lg" href="/quiz">Generate AI Quiz</Link>
        </div>
        <ol className="loop" aria-label="Product loop">
          {LOOP.map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              {i > 0 && <li className="sep" aria-hidden>→</li>}
              <li>{s}</li>
            </span>
          ))}
        </ol>
      </section>

      <div className="grid-3">
        <section className="card">
          <h2>Competency Gap Analysis</h2>
          <p className="card-sub">Required vs current proficiency per role competency, with priority ranking and a data-grounded explanation.</p>
          <Link className="btn" href="/gaps">Open Gap Analysis</Link>
        </section>
        <section className="card">
          <h2>Personalised iGOT Learning Path</h2>
          <p className="card-sub">A phased sequence of iGOT courses mapped to your actual gaps — this platform recommends, iGOT delivers.</p>
          <Link className="btn" href="/path">View Learning Path</Link>
        </section>
        <section className="card">
          <h2>AI Quiz Generator</h2>
          <p className="card-sub">Upload training material; every generated question is grounded in the source with viewable evidence, and quiz results update competencies.</p>
          <Link className="btn" href="/quiz">Open Quiz Studio</Link>
        </section>
      </div>
    </div>
  );
}
