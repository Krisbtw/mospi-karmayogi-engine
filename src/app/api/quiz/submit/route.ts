import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { competencyMap, roleMap } from '@/lib/competency-data';
import { quizGain } from '@/lib/scoring';
import { getDB, uid, updateDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

const Body = z.object({
  quizId: z.string().min(1),
  employeeId: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  const { quizId, employeeId, answers } = parsed.data;

  const db = await getDB();
  const quiz = db.quizzes.find(q => q.id === quizId);
  if (!quiz) return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  if (db.attempts.some(a => a.quizId === quizId && a.employeeId === employeeId)) {
    return NextResponse.json({ error: 'You have already attempted this quiz. Generate a new one to practise again.' }, { status: 409 });
  }

  // Deterministic scoring
  let correct = 0;
  for (const q of quiz.questions) if (answers[q.id] === q.correctIndex) correct++;
  const total = quiz.questions.length;
  const percent = Math.round((correct / total) * 100);

  const state = db.competencies.find(s => s.employeeId === employeeId && s.competencyId === quiz.competencyId);
  const before = state?.current ?? 0;
  const gain = quizGain(before, percent);
  const after = before + gain;
  const now = new Date().toISOString();

  await updateDB(data => {
    const s = data.competencies.find(x => x.employeeId === employeeId && x.competencyId === quiz.competencyId);
    if (s) { s.current = after; s.updatedAt = now; }
    else data.competencies.push({ employeeId, competencyId: quiz.competencyId, current: after, updatedAt: now });
    data.events.push({
      id: uid('EV'), employeeId, competencyId: quiz.competencyId, type: 'ai-quiz',
      before, after, detail: `AI quiz “${quiz.title}” — ${correct}/${total} correct (${percent}%)`, createdAt: now,
    });
    data.attempts.push({ id: uid('ATT'), employeeId, quizId, competencyId: quiz.competencyId, correct, total, percent, before, after, improvement: gain, createdAt: now });
  });

  const required = roleMap.get(employee.role)?.competencies.find(c => c.id === quiz.competencyId)?.required ?? null;
  const review = quiz.questions.map(q => ({
    ...q, userAnswer: answers[q.id] ?? -1, correct: answers[q.id] === q.correctIndex,
  }));
  return NextResponse.json({
    percent, correct, total, before, after, improvement: gain,
    competencyName: competencyMap.get(quiz.competencyId)?.name ?? quiz.competencyId,
    required, review,
  });
}
