'use client';
import Link from 'next/link';
import { getJSON, useAsync, useEmployee } from '@/lib/client';
import { Badge, Card, EmptyState, ErrorBanner, Metric, Spinner } from '@/components/ui';
import { GapTable } from '@/components/GapTable';
import type { GapRow } from '@/lib/types';

interface GapsResp { assessed: boolean; overall: number; rows: GapRow[]; explanation: string | null; explanationSource: 'ai' | 'data' | null; latestAssessment: { overall: number; completedAt: string } | null; }

export default function GapsPage() {
  const { id, employee, loading, error } = useEmployee();
  const { data, loading: gql, error: gqlErr } = useAsync(
    () => getJSON<GapsResp>(`/api/gaps?employeeId=${encodeURIComponent(id)}`),
    [id],
  );

  if (loading || gql) return <Spinner label="Loading gap analysis…" />;
  if (error || gqlErr) return <ErrorBanner message={error ?? gqlErr ?? 'Failed to load.'} />;
  if (!data) return null;

  if (!data.assessed) {
    return (
      <EmptyState title="No assessment yet">
        {employee?.name ?? 'This employee'} has not completed a diagnostic assessment. Take the assessment first —
        gaps are computed as Required − Current proficiency.
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" href="/assess">Start Assessment</Link>
        </div>
      </EmptyState>
    );
  }

  const critical = data.rows.filter(r => r.priority === 'Critical' || r.priority === 'High').length;
  const complete = data.rows.filter(r => r.priority === 'Complete').length;

  return (
    <div>
      <Card title="Competency Gap Analysis" subtitle="Gap = Required proficiency − Current proficiency. Highest-priority gaps first.">
        <div className="grid-metrics" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
          <Metric value={`${data.overall}%`} label="Overall Competency" />
          <Metric value={critical} label="Critical / High Gaps" />
          <Metric value={complete} label="Complete" />
          <Metric value={data.latestAssessment ? data.latestAssessment.completedAt.slice(0, 10) : '—'} label="Latest Assessment" />
        </div>
      </Card>
      <Card title="Required vs Current">
        <GapTable rows={data.rows} />
      </Card>
      {data.explanation && (
        <Card title="Explanation" actions={<Badge kind={data.explanationSource === 'ai' ? 'ai' : 'demo'}>{data.explanationSource === 'ai' ? 'AI generated' : 'Data generated'}</Badge>}>
          <p style={{ margin: 0 }}>{data.explanation}</p>
        </Card>
      )}
      <div className="cta-row">
        <Link className="btn btn-primary" href="/path">Build iGOT Learning Path</Link>
        <Link className="btn" href="/quiz">Generate AI Quiz</Link>
      </div>
    </div>
  );
}
