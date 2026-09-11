import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { competencyMap, roleMap } from '@/lib/competency-data';
import { buildGapRows, gapExplanation } from '@/lib/gap';
import { getDB, uid, updateDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

const Body = z.object({
  assessmentId: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });

  const db = await getDB();
  const assessment = db.assessments.find(a => a.id === parsed.data.assessmentId);
  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
  if (assessment.status === 'completed') return NextResponse.json({ error: 'This assessment was already submitted.' }, { status: 409 });
  const employee = db.employees.find(e => e.id === assessment.employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });

  // Deterministic scoring — no LLM decides numerical scores.
  const byComp = new Map<string, { correct: number; total: number }>();
  for (const q of assessment.questions) {
    const rec = byComp.get(q.competencyId) ?? { correct: 0, total: 0 };
    rec.total++;
    if (parsed.data.answers[q.id] === q.correctIndex) rec.correct++;
    byComp.set(q.competencyId, rec);
  }
  const pcts: { id: string; pct: number; correct: number; total: number }[] = [];
  for (const [cid, rec] of byComp) pcts.push({ id: cid, pct: Math.round((rec.correct / rec.total) * 100), correct: rec.correct, total: rec.total });
  const overall = pcts.length ? Math.round(pcts.reduce((s, p) => s + p.pct, 0) / pcts.length) : 0;

  const prior = db.events.some(e => e.employeeId === employee.id && (e.type === 'diagnostic' || e.type === 'reassessment'));
  const now = new Date().toISOString();

  await updateDB(data => {
    for (const p of pcts) {
      const existing = data.competencies.find(s => s.employeeId === employee.id && s.competencyId === p.id);
      const before = existing?.current;
      if (existing) { existing.current = p.pct; existing.updatedAt = now; }
      else data.competencies.push({ employeeId: employee.id, competencyId: p.id, current: p.pct, updatedAt: now });
      data.events.push({
        id: uid('EV'), employeeId: employee.id, competencyId: p.id,
        type: prior ? 'reassessment' : 'diagnostic', before, after: p.pct,
        detail: `${prior ? 'Reassessment' : 'Diagnostic assessment'} — ${p.correct}/${p.total} correct on ${competencyMap.get(p.id)?.name ?? p.id}`,
        createdAt: now,
      });
    }
    const a = data.assessments.find(x => x.id === assessment.id)!;
    a.status = 'completed'; a.answers = parsed.data.answers; a.overall = overall; a.completedAt = now;
  });

  const states = (await getDB()).competencies.filter(s => s.employeeId === employee.id);
  const rows = buildGapRows(states, employee.role);
  const explanation = await gapExplanation(employee, rows, overall, now);
  return NextResponse.json({ overall, rows, explanation: explanation.text, explanationSource: explanation.source, reassessment: prior });
}
