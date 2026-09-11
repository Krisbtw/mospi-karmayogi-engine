'use client';
import { competencyMap } from '@/lib/competency-data';
import { getJSON, useAsync, useEmployee } from '@/lib/client';
import { Badge, Card, ErrorBanner, Spinner } from '@/components/ui';
import { GapTable, priorityBadge } from '@/components/GapTable';
import type { CourseRecord, GapRow } from '@/lib/types';

interface EventRow { id: string; type: string; competencyName: string; before?: number; after?: number; detail: string; createdAt: string; }
interface HistoryResp { courses: CourseRecord[]; rows: GapRow[]; events: EventRow[]; }

const TYPE_BADGE: Record<string, string> = { diagnostic: 'low', reassessment: 'ai', 'course-completion': 'complete', 'ai-quiz': 'ai', enrollment: 'demo' };

export default function HistoryPage() {
  const { id, loading, error } = useEmployee();
  const { data, loading: hLoading, error: hError } = useAsync(
    () => getJSON<HistoryResp>(`/api/history?employeeId=${encodeURIComponent(id)}`),
    [id],
  );
  if (loading || hLoading) return <Spinner label="Loading history…" />;
  if (error || hError) return <ErrorBanner message={error ?? hError ?? 'Failed to load.'} />;
  if (!data) return null;

  return (
    <div>
      <Card title="Competency History" subtitle="Every competency change is recorded with its cause: diagnostic, course completion, AI quiz, or reassessment.">
        {data.events.length ? (
          <ul className="timeline">
            {data.events.map(e => (
              <li key={e.id}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge kind={TYPE_BADGE[e.type] ?? 'low'}>{e.type}</Badge>
                  <span className="cell-strong">{e.competencyName}</span>
                  {e.before != null && e.after != null && <span>{e.before}% → {e.after}% ({e.after - e.before >= 0 ? '+' : ''}{e.after - e.before} pp)</span>}
                  <span className="cell-sub">{e.createdAt.slice(0, 10)}</span>
                </div>
                <div className="cell-sub">{e.detail}</div>
              </li>
            ))}
          </ul>
        ) : <p className="card-sub">No competency events yet.</p>}
      </Card>
      <Card title="Learning History">
        {data.courses.length ? (
          <table className="table">
            <thead><tr><th>Course</th><th>Provider</th><th>Competency</th><th>Score</th><th>Certificate</th><th>Hours</th><th>Completed</th></tr></thead>
            <tbody>
              {data.courses.map((c, i) => (
                <tr key={i}>
                  <td className="cell-strong">{c.title}</td><td>{c.provider}</td>
                  <td><Badge kind={priorityBadge('Low')}>{competencyMap.get(c.competencyId)?.name ?? c.competencyId}</Badge></td>
                  <td>{c.score}%</td><td>{c.certificate ? 'Yes' : 'No'}</td><td>{c.hours}</td><td>{c.completedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="card-sub">No completed courses yet.</p>}
      </Card>
      <Card title="Current Competency Snapshot"><GapTable rows={data.rows} /></Card>
    </div>
  );
}
