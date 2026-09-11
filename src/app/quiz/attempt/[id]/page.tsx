'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { competencyMap } from '@/lib/competency-data';
import { getJSON, postJSON, useAsync, useEmployeeId } from '@/lib/client';
import { Badge, Card, ErrorBanner, Spinner } from '@/components/ui';
import { SourceView } from '@/components/SourceView';
import type { GeneratedQuestion } from '@/lib/types';

interface AttemptQ { id: string; question: string; options: string[]; difficulty: string; bloom: string; type: string; competencyId: string; sourceDocTitle: string; sourceSection: string; chunkIndex: number; evidence: string; confidence: number; }
interface ReviewQ extends GeneratedQuestion { userAnswer: number; correct: boolean; }
interface SubmitResp { percent: number; correct: number; total: number; before: number; after: number; improvement: number; competencyName: string; required: number | null; review: ReviewQ[]; }

export default function AttemptPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id;
  const employeeId = useEmployeeId();
  const { data, loading, error } = useAsync(
    () => getJSON<{ quiz: { id: string; title: string; mode: string; questions: AttemptQ[] } }>(`/api/quiz/${quizId}`),
    [quizId],
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResp | null>(null);

  async function submit() {
    setBusy(true); setErr(null);
    try { setResult(await postJSON<SubmitResp>('/api/quiz/submit', { quizId, employeeId, answers })); window.scrollTo({ top: 0 }); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  if (loading) return <Spinner label="Loading quiz…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  if (result) {
    return (
      <div>
        {err && <ErrorBanner message={err} />}
        <Card title="Quiz Result & Competency Update" subtitle={`${result.competencyName}${result.required != null ? ` · required ${result.required}%` : ''} · deterministic update from quiz performance`}>
          <div className="stat-strip">
            <div className="stat"><div className="s-value">{result.before}%</div><div className="s-label">Before</div></div>
            <div className="arrow-step" aria-hidden>→</div>
            <div className="stat"><div className="s-value">{result.correct}/{result.total}</div><div className="s-label">Quiz ({result.percent}%)</div></div>
            <div className="arrow-step" aria-hidden>→</div>
            <div className="stat"><div className="s-value">{result.after}%</div><div className="s-label">After</div></div>
            <div className="arrow-step" aria-hidden>→</div>
            <div className="stat stat-good"><div className="s-value">+{result.improvement} pp</div><div className="s-label">Improvement</div></div>
          </div>
        </Card>
        <Card title="Review" subtitle="Each question shows the correct answer, explanation, and its source evidence.">
          {result.review.map((q, i) => (
            <div className="q-card" key={q.id}>
              <div className="q-meta">
                <span className="cell-strong">Q{i + 1}</span>
                <Badge kind={q.correct ? 'complete' : 'critical'}>{q.correct ? 'Correct' : 'Incorrect'}</Badge>
                <Badge kind="demo">{q.difficulty}</Badge>
                <Badge kind="ai">{q.bloom}</Badge>
              </div>
              <div style={{ marginBottom: 8 }}>{q.question}</div>
              {q.options.map((o, oi) => (
                <div key={oi} className={`option-row${oi === q.correctIndex ? ' correct' : q.userAnswer === oi && !q.correct ? ' wrong' : ''}`}>
                  <span>{String.fromCharCode(65 + oi)}.</span><span>{o}{oi === q.correctIndex ? ' ✓' : ''}{q.userAnswer === oi && oi !== q.correctIndex ? ' (your answer)' : ''}</span>
                </div>
              ))}
              <p className="card-sub" style={{ marginTop: 8 }}>{q.explanation}</p>
              <SourceView q={q} />
            </div>
          ))}
        </Card>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/gaps">View Updated Gaps</Link>
          <Link className="btn" href="/dashboard">Dashboard</Link>
        </div>
      </div>
    );
  }

  const quiz = data.quiz;
  return (
    <div>
      {err && <ErrorBanner message={err} />}
      <Card title={quiz.title} subtitle={`${quiz.questions.length} questions · grounded in “${quiz.questions[0]?.sourceDocTitle ?? 'learning material'}” · answered ${Object.keys(answers).length}/${quiz.questions.length}`}>
        {quiz.questions.map((q, i) => (
          <div className="q-card" key={q.id}>
            <div className="q-meta">
              <span className="cell-strong">Q{i + 1}</span>
              <Badge kind="demo">{q.difficulty}</Badge>
              <Badge kind="ai">{q.bloom}</Badge>
              <Badge kind="low">{competencyMap.get(q.competencyId)?.name ?? q.competencyId}</Badge>
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
        <button className="btn btn-primary" onClick={submit} disabled={busy || Object.keys(answers).length !== quiz.questions.length}>
          {busy ? 'Submitting…' : 'Submit Quiz'}
        </button>
      </Card>
    </div>
  );
}
