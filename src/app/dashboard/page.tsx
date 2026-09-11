'use client';
import Link from 'next/link';
import { getJSON, useAsync, useEmployee } from '@/lib/client';
import { Badge, Card, ErrorBanner, Metric, Spinner } from '@/components/ui';
import { priorityBadge } from '@/components/GapTable';
import type { GapRow } from '@/lib/types';

interface DashResp {
  employee: { id: string; name: string; role: string; department: string; designation: string };
  assessed: boolean; overall: number; criticalCount: number; topGaps: GapRow[];
  recommended: number; inProgress: number; completedCourses: number; learningHours: number;
  latestAssessment: { overall: number; completedAt: string } | null;
  lastQuiz: { percent: number; before: number; after: number; improvement: number } | null;
}
const LOOP = ['Assess', 'Identify Gaps', 'Learn', 'Practise', 'Reassess'];

export default function DashboardPage() {
  const { id, loading, error } = useEmployee();
  const { data, loading: dLoading, error: dError } = useAsync(
    () => getJSON<DashResp>(`/api/dashboard?employeeId=${encodeURIComponent(id)}`),
    [id],
  );
  if (loading || dLoading) return <Spinner label="Loading dashboard…" />;
  if (error || dError) return <ErrorBanner message={error ?? dError ?? 'Failed to load.'} />;
  if (!data) return null;

  return (
    <div>
      <Card title={`Dashboard — ${data.employee.name}`} subtitle={`${data.employee.role} · ${data.employee.designation}, ${data.employee.department}`}>
        <ol className="loop" aria-label="Loop">{LOOP.map((s, i) => (<span key={s} style={{ display: 'contents' }}>{i > 0 && <li className="sep" aria-hidden>→</li>}<li>{s}</li></span>))}</ol>
      </Card>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', marginBottom: 18 }}>
        <Metric value={data.assessed ? `${data.overall}%` : '—'} label="Overall Competency" />
        <Metric value={data.criticalCount} label="Critical Gaps" />
        <Metric value={data.recommended} label="Recommended Courses" />
        <Metric value={data.completedCourses} label="Completed Courses" />
        <Metric value={data.learningHours} label="Learning Hours" />
        <Metric value={data.latestAssessment ? `${data.latestAssessment.overall}%` : '—'} label="Latest Assessment" />
      </div>
      <div className="grid-2">
        <Card title="Critical Gaps" subtitle={data.assessed ? 'Highest-priority competency gaps for this role.' : 'Take the diagnostic assessment to compute gaps.'}>
          {data.topGaps.length ? (
            <table className="table">
              <thead><tr><th>Competency</th><th>Current</th><th>Required</th><th>Gap</th><th>Priority</th></tr></thead>
              <tbody>
                {data.topGaps.map(g => (
                  <tr key={g.competencyId}><td className="cell-strong">{g.name}</td><td>{g.current}%</td><td>{g.required}%</td><td>{g.gap} pp</td><td><Badge kind={priorityBadge(g.priority)}>{g.priority}</Badge></td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="card-sub">{data.assessed ? 'No open gaps — all competencies meet requirements.' : 'No assessment data yet.'}</p>}
          <div className="cta-row"><Link className="btn" href="/gaps">Full Gap Analysis</Link></div>
        </Card>
        <Card title="Learning Progress" subtitle={data.lastQuiz ? `Last AI quiz: ${data.lastQuiz.before}% → ${data.lastQuiz.after}% (+${data.lastQuiz.improvement} pp).` : 'No AI quiz taken yet — practise with a source-grounded quiz.'}>
          <p className="card-sub">{data.inProgress} course(s) in progress · {data.recommended} recommended on iGOT.</p>
          <div className="cta-row">
            <Link className="btn" href="/path">Learning Path</Link>
            <Link className="btn" href="/quiz">AI Quiz Generator</Link>
          </div>
        </Card>
      </div>
      <div className="grid-3">
        <Card title="Competency Gap Analysis"><p className="card-sub">Required vs current proficiency with priorities and explanations.</p><Link className="btn" href="/gaps">Open</Link></Card>
        <Card title="Personalised Learning Path"><p className="card-sub">Phased iGOT recommendations mapped to your gaps.</p><Link className="btn" href="/path">Open</Link></Card>
        <Card title="AI Quiz Generator"><p className="card-sub">Grounded in uploaded material; results update competencies.</p><Link className="btn" href="/quiz">Open</Link></Card>
      </div>
    </div>
  );
}
