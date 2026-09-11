'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { COMPETENCIES, competencyMap } from '@/lib/competency-data';
import { getJSON, useAsync } from '@/lib/client';
import { Badge, Card, ErrorBanner, Spinner } from '@/components/ui';
import { SourceView } from '@/components/SourceView';
import type { GeneratedQuestion } from '@/lib/types';

interface DocSummary { id: string; title: string; kind: string; chunkCount: number; sections: number; uploadedAt: string; }
interface GenResp { quiz: { id: string; title: string; mode: 'ai' | 'demo'; questions: GeneratedQuestion[] }; generated: number; note?: string; }

export default function QuizStudioPage() {
  const { data: docs, loading, error, reload } = useAsync(() => getJSON<{ documents: DocSummary[] }>('/api/documents'), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [docTitle, setDocTitle] = useState('');
  const [upBusy, setUpBusy] = useState(false);
  const [upMsg, setUpMsg] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);

  const [form, setForm] = useState({ documentId: '', competencyId: 'C-SAMP', count: 5, difficulty: 'Mixed', type: 'MCQ' });
  const [genBusy, setGenBusy] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [result, setResult] = useState<GenResp | null>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setUpErr('Choose a file first.'); return; }
    setUpBusy(true); setUpErr(null); setUpMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (docTitle.trim()) fd.append('title', docTitle.trim());
      const res = await fetch('/api/documents', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed.');
      setUpMsg(`Processed “${json.document.title}” — ${json.document.sections} sections, ${json.document.chunkCount} chunks embedded and indexed.`);
      if (fileRef.current) fileRef.current.value = '';
      reload();
    } catch (e) { setUpErr(e instanceof Error ? e.message : String(e)); }
    finally { setUpBusy(false); }
  }



  async function generateQuiz() {
    setGenBusy(true); setGenErr(null); setResult(null);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: form.documentId || docs?.documents[0]?.id,
          competencyId: form.competencyId,
          count: Number(form.count), difficulty: form.difficulty, type: form.type,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Quiz generation failed.');
      setResult(json as GenResp);
    } catch (e) { setGenErr(e instanceof Error ? e.message : String(e)); }
    finally { setGenBusy(false); }
  }

  if (loading) return <Spinner label="Loading documents…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <Card title="Upload Learning Material" subtitle="PDF · DOCX · PPTX · TXT → text extraction → chunking → embedding → retrieval. Unsupported or unreadable files return an explicit error.">
        {upMsg && <div className="alert alert-ok">{upMsg}</div>}
        {upErr && <ErrorBanner message={upErr} />}
        <div className="form-grid">
          <div><label>File (.pdf, .docx, .pptx, .txt — max 20 MB)</label><input ref={fileRef} type="file" accept=".pdf,.docx,.pptx,.txt" /></div>
          <div><label>Title (optional)</label><input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="e.g. Field Operations Manual 2025" /></div>
        </div>
        <div className="cta-row"><button className="btn btn-primary" onClick={upload} disabled={upBusy}>{upBusy ? 'Processing document…' : 'Upload & Process'}</button></div>
        {docs && docs.documents.length > 0 && (
          <table className="table" style={{ marginTop: 12 }}>
            <thead><tr><th>Document</th><th>Type</th><th>Sections</th><th>Chunks</th></tr></thead>
            <tbody>
              {docs.documents.map(d => <tr key={d.id}><td className="cell-strong">{d.title}</td><td>{d.kind.toUpperCase()}</td><td>{d.sections}</td><td>{d.chunkCount}</td></tr>)}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Generate AI Quiz" subtitle="Questions are grounded in the uploaded material — each carries source evidence you can inspect.">
        {genErr && <ErrorBanner message={genErr} />}
        <div className="form-grid">
          <div>
            <label>Learning material</label>
            <select value={form.documentId || docs?.documents[0]?.id || ''} onChange={e => setForm(f => ({ ...f, documentId: e.target.value }))}>
              {(docs?.documents ?? []).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label>Competency</label>
            <select value={form.competencyId} onChange={e => setForm(f => ({ ...f, competencyId: e.target.value }))}>
              {COMPETENCIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label>Number of questions (1–10)</label><input type="number" min={1} max={10} value={form.count} onChange={e => setForm(f => ({ ...f, count: Number(e.target.value) }))} /></div>
          <div>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              {['Easy', 'Medium', 'Hard', 'Mixed'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label>Question type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['MCQ', 'Conceptual', 'Scenario-based'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="cta-row">
          <button className="btn btn-primary" onClick={generateQuiz} disabled={genBusy}>{genBusy ? 'Generating…' : 'Generate Quiz'}</button>
        </div>
      </Card>

      {result && (
        <Card
          title={result.quiz.title}
          subtitle={`${result.generated} validated questions · every question passed 4-option / single-correct / source-evidence checks.`}
          actions={<Badge kind={result.quiz.mode === 'ai' ? 'ai' : 'demo'}>{result.quiz.mode === 'ai' ? 'AI generated' : 'Deterministic fallback'}</Badge>}
        >
          {result.note && <div className="alert alert-ok">{result.note}</div>}
          {result.quiz.questions.map((q, i) => (
            <div className="q-card" key={q.id}>
              <div className="q-meta">
                <span className="cell-strong">Q{i + 1}</span>
                <Badge kind="demo">{q.difficulty}</Badge>
                <Badge kind="ai">{q.bloom}</Badge>
                <Badge kind="low">{competencyMap.get(q.competencyId)?.name ?? q.competencyId}</Badge>
                <Badge kind="complete">Validated</Badge>
              </div>
              <div style={{ marginBottom: 8 }}>{q.question}</div>
              {q.options.map((o, oi) => (
                <div key={oi} className={`option-row${oi === q.correctIndex ? ' correct' : ''}`}>
                  <span>{String.fromCharCode(65 + oi)}.</span><span>{o}{oi === q.correctIndex ? ' ✓' : ''}</span>
                </div>
              ))}
              <p className="card-sub" style={{ marginTop: 8 }}>{q.explanation}</p>
              <SourceView q={q} />
            </div>
          ))}
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/quiz/attempt/${result.quiz.id}`}>Take this quiz</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
