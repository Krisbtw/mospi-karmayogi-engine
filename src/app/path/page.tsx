'use client';
import { competencyMap } from '@/lib/competency-data';
import Link from 'next/link';
import { useState } from 'react';
import { getJSON, postJSON, useAsync, useEmployee } from '@/lib/client';
import { Badge, Card, ErrorBanner, Spinner } from '@/components/ui';
import type { CourseRecord, PathPhase } from '@/lib/types';

interface PathResp { phases: PathPhase[]; completed: CourseRecord[]; mode: 'live' | 'demo'; }

export default function PathPage() {
  const { id, employee, loading, error } = useEmployee();
  const { data, loading: pLoading, error: pError, reload } = useAsync(
    () => getJSON<PathResp>(`/api/path?employeeId=${encodeURIComponent(id)}`),
    [id],
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function enroll(courseId: string) {
    setBusy(courseId); setErr(null); setMsg(null);
    try { const r = await postJSON<{ note: string }>('/api/igot/enroll', { employeeId: id, courseId }); setMsg(r.note); reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  }

  async function complete(courseId: string) {
    setBusy(courseId); setErr(null); setMsg(null);
    try {
      const r = await postJSON<{ before: number; after: number; improvement: number; competencyName: string }>('/api/igot/complete', { employeeId: id, courseId, score: 85 });
      setMsg(`Completion recorded for ${r.competencyName}: ${r.before}% → ${r.after}% (+${r.improvement} pp).`);
      reload();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  }

  if (loading || pLoading) return <Spinner label="Loading learning path…" />;
  if (error || pError) return <ErrorBanner message={error ?? pError ?? 'Failed to load.'} />;
  if (!data) return null;

  return (
    <div>
      {msg && <div className="alert alert-ok">{msg}</div>}
      {err && <ErrorBanner message={err} />}
      {data.mode === 'demo' && (
        <div className="alert alert-ok">iGOT integration is in <strong>demo mode</strong> — enrollments are recorded locally and courses open on igotkarmayogi.gov.in. This platform is a recommendation layer over iGOT, not a replacement.</div>
      )}
      <Card title="Personalised iGOT Learning Path" subtitle={`Built from ${employee?.name ?? 'employee'}’s actual competency gaps · completed courses are excluded`}>
        {data.phases.map((phase, pi) => (
          <div key={phase.name}>
            {pi > 0 && <div className="phase-arrow" aria-hidden>↓</div>}
            <div className="phase">
              <div className="phase-head"><h3>{phase.name}</h3><span className="cell-sub">{phase.description}</span></div>
              {phase.cta === 'assessment' ? (
                <div className="path-item">
                  <h3>Reassess & verify improvement</h3>
                  <p className="card-sub">After completing the phases above, retake the diagnostic or take an AI quiz built from learning material to update your competency scores.</p>
                  <div className="path-actions">
                    <Link className="btn" href="/assess">Retake Diagnostic</Link>
                    <Link className="btn" href="/quiz">Generate AI Quiz</Link>
                  </div>
                </div>
              ) : phase.items.length === 0 ? (
                <p className="card-sub">No courses needed at this level.</p>
              ) : phase.items.map(item => (
                <div className="path-item" key={item.courseId}>
                  <h3>{item.title}</h3>
                  <div className="path-meta">
                    <span>Competency: <b>{item.competencyName}</b> ({item.current}% → required {item.required}%)</span>
                    <span>Level: <b>{item.level}</b></span>
                    <span>Difficulty: <b>{item.difficulty}</b></span>
                    <span>Duration: <b>{item.hours} h</b></span>
                    <span>Provider: <b>{item.provider}</b></span>
                    <Badge kind={item.status === 'In Progress' ? 'ai' : 'low'}>{item.status}</Badge>
                  </div>
                  <div className="path-actions">
                    <a className="btn btn-primary" href={item.url} target="_blank" rel="noopener noreferrer">Open on iGOT ↗</a>
                    {item.status === 'Recommended' && (
                      <button className="btn" onClick={() => enroll(item.courseId)} disabled={busy === item.courseId}>
                        {busy === item.courseId ? 'Enrolling…' : 'Enroll (records locally in demo)'}
                      </button>
                    )}
                    {item.status === 'In Progress' && (
                      <button className="btn" onClick={() => complete(item.courseId)} disabled={busy === item.courseId}>
                        {busy === item.courseId ? 'Recording…' : 'Record completion (demo, score 85%)'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Completed Learning History" subtitle="Already-finished courses are never re-recommended.">
        {data.completed.length ? (
          <table className="table">
            <thead><tr><th>Course</th><th>Provider</th><th>Competency</th><th>Score</th><th>Certificate</th><th>Hours</th><th>Completed</th></tr></thead>
            <tbody>
              {data.completed.map((c, i) => (
                <tr key={i}>
                  <td className="cell-strong">{c.title}</td><td>{c.provider}</td>
                  <td>{competencyMap.get(c.competencyId)?.name ?? c.competencyId}</td><td>{c.score}%</td>
                  <td>{c.certificate ? 'Yes' : 'No'}</td><td>{c.hours}</td><td>{c.completedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="card-sub">No completed courses yet.</p>}
      </Card>
    </div>
  );
}
