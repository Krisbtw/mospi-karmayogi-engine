'use client';
import Link from 'next/link';
import { useState } from 'react';
import { roleMap } from '@/lib/competency-data';
import { postJSON, useEmployee } from '@/lib/client';
import { Badge, Card, ErrorBanner, Spinner } from '@/components/ui';
import { GapTable } from '@/components/GapTable';
import type { GapRow } from '@/lib/types';

interface PublicQ { id: string; question: string; options: string[]; competencyId: string; difficulty: string; bloom: string; }
interface SubmitResp { overall: number; rows: GapRow[]; explanation: string; explanationSource: 'ai' | 'data'; reassessment: boolean; }

export default function AssessPage() {
  const { employee, id, loading, error } = useEmployee();
  const [assessment, setAssessment] = useState<{ id: string; role: string; questions: PublicQ[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResp | null>(null);

  async function start() {
    setBusy(true); setErr(null); setResult(null); setAnswers({});
    try { const r = await postJSON<{ assessment: { id: string; role: string; questions: PublicQ[] } }>('/api/assessment/start', { employeeId: id }); setAssessment(r.assessment); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!assessment) return;
    setBusy(true); setErr(null);
    try { const r = await postJSON<SubmitResp>('/api/assessment/submit', { assessmentId: assessment.id, answers }); setResult(r); setAssessment(null); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  if (loading) return <Spinner label="Loading…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      {err && <ErrorBanner message={err} />}
      {result ? (
        <>
          <Card title="Assessment Results" actions={<Badge kind={result.reassessment ? 'ai' : 'demo'}>{result.reassessment ? 'Reassessment' : 'Diagnostic'}</Badge>}>
            <div className="stat-strip">
              <div className="stat"><div className="s-value">{result.overall}%</div><div className="s-label">Overall Score</div></div>
              <div className="stat"><div className="s-value">{result.rows.filter(r => r.priority === 'Critical' || r.priority === 'High').length}</div><div className="s-label">Critical / High Gaps</div></div>
            </div>
          </Card>
          <Card title="Competency Gap Analysis" subtitle="Deterministic scoring from your answers — required levels come from your role.">
            <GapTable rows={result.rows} />
          </Card>
          <Card title="Why these gaps" actions={<Badge kind={result.explanationSource === 'ai' ? 'ai' : 'demo'}>{result.explanationSource === 'ai' ? 'AI generated' : 'Data generated'}</Badge>}>
            <p style={{ margin: 0 }}>{result.explanation}</p>
          </Card>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/gaps">View Gap Analysis</Link>
            <Link className="btn" href="/path">View Learning Path</Link>
          </div>
        </>
      ) : assessment ? (
        <Card title="Diagnostic Assessment" subtitle={`${assessment.role} · ${assessment.questions.length} competency-mapped MCQs · answered ${Object.keys(answers).length}/${assessment.questions.length}`}>
          {assessment.questions.map((q, i) => (
            <div className="q-card" key={q.id}>
              <div className="q-meta">
                <span className="cell-strong">Q{i + 1}</span>
                <Badge kind="low">{q.competencyId}</Badge>
                <Badge kind="demo">{q.difficulty}</Badge>
                <Badge kind="ai">{q.bloom}</Badge>
              </div>
              <div style={{ marginBottom: 8 }}>{q.question}</div>
              {q.options.map((o, oi) => (
                <label key={oi} className="option-row" style={{ cursor: 'pointer' }}>
                  <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          ))}
          <button className="btn btn-primary" onClick={submit} disabled={busy || Object.keys(answers).length !== assessment.questions.length}>
            {busy ? 'Submitting…' : 'Submit Assessment'}
          </button>
        </Card>
      ) : (
        <Card title="Diagnostic Assessment" subtitle="Real MCQs mapped to the competencies required for the selected employee’s role. Scores are computed deterministically.">
          {employee && (
            <p className="card-sub">
              <strong>{employee.name}</strong> · {roleMap.get(employee.role)?.title} · {employee.designation}, {employee.department} · {employee.yearsExperience} yrs experience
            </p>
          )}
          <button className="btn btn-primary btn-lg" onClick={start} disabled={busy}>{busy ? 'Preparing…' : 'Start Assessment'}</button>
        </Card>
      )}
    </div>
  );
}
