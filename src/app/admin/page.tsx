'use client';
import { getJSON, useAsync } from '@/lib/client';
import { Badge, Card, ErrorBanner, Metric, Spinner } from '@/components/ui';

interface AdminResp {
  assessedCount: number; totalEmployees: number; avgCompetency: number | null;
  topRequirement: { competencyId: string; name: string; employees: number; avgGap: number } | null;
  suggestedCourse: { title: string; level: string; hours: number; provider: string; url: string } | null;
  learningDemand: { recommended: number; enrolled: number };
  improvement: { avg: number | null; samples: number };
  employees: { id: string; name: string; department: string; designation: string; role: string; overall: number | null; critical: number; assessed: boolean; lastEvent: string | null }[];
}

export default function AdminPage() {
  const { data, loading, error } = useAsync(() => getJSON<AdminResp>('/api/admin'), []);
  if (loading) return <Spinner label="Loading department analytics…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  return (
    <div>
      <Card title="Training & Development Dashboard" subtitle="What competency gaps exist across the department?">
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
          <Metric value={data.assessedCount} label="Employees Assessed" />
          <Metric value={data.avgCompetency != null ? `${data.avgCompetency}%` : '—'} label="Average Competency" />
          <Metric value={data.improvement.avg != null ? `+${data.improvement.avg} pp` : '—'} label={`Avg Improvement (${data.improvement.samples} quizzes)`} />
          <Metric value={data.learningDemand.recommended} label="Learning Demand (recommended)" />
          <Metric value={data.learningDemand.enrolled} label="Active Enrollments" />
        </div>
      </Card>
      <div className="grid-2">
        <Card title="Top Training Requirement">
          {data.topRequirement ? (
            <>
              <p><strong>{data.topRequirement.name}</strong> — Critical/High gap for {data.topRequirement.employees} employee(s), average gap {data.topRequirement.avgGap} pp.</p>
              {data.suggestedCourse && (
                <p className="card-sub">Recommended intervention: <strong>{data.suggestedCourse.title}</strong> ({data.suggestedCourse.level} · {data.suggestedCourse.hours} h · {data.suggestedCourse.provider})</p>
              )}
              <div className="cta-row"><a className="btn btn-primary" href={data.suggestedCourse?.url ?? 'https://igotkarmayogi.gov.in'} target="_blank" rel="noopener noreferrer">Open on iGOT ↗</a></div>
            </>
          ) : <p className="card-sub">No assessed employees yet.</p>}
        </Card>
        <Card title="Improvement Trend" subtitle="Average competency change from AI quiz attempts.">
          {data.improvement.samples > 0
            ? <p style={{ margin: 0 }}>Across {data.improvement.samples} recorded AI quiz attempt(s), competencies improved by an average of <strong>+{data.improvement.avg} pp</strong>.</p>
            : <p className="card-sub">Awaiting AI quiz data — employees can practise on the Quiz Studio to generate improvement evidence.</p>}
        </Card>
      </div>
      <Card title="Employee Overview">
        <table className="table">
          <thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Overall</th><th>Critical Gaps</th><th>Last Activity</th><th>Status</th></tr></thead>
          <tbody>
            {data.employees.map(e => (
              <tr key={e.id}>
                <td className="cell-strong">{e.name}</td><td>{e.department}</td><td>{e.role}</td>
                <td>{e.assessed && e.overall != null ? `${e.overall}%` : '—'}</td>
                <td>{e.assessed ? e.critical : '—'}</td>
                <td>{e.lastEvent ? e.lastEvent.slice(0, 10) : '—'}</td>
                <td><Badge kind={e.assessed ? 'complete' : 'demo'}>{e.assessed ? 'Assessed' : 'Not assessed'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
