import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BANK } from '@/lib/assessment-bank';
import { roleMap } from '@/lib/competency-data';
import { getDB, uid, updateDB } from '@/lib/store';
import type { BankQuestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

const Body = z.object({ employeeId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === parsed.data.employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  const role = roleMap.get(employee.role);
  if (!role) return NextResponse.json({ error: 'Employee has no valid role.' }, { status: 400 });

  const existing = db.assessments.find(a => a.employeeId === employee.id && a.status === 'in-progress');
  if (existing) return NextResponse.json({ assessment: { id: existing.id, role: role.title, questions: existing.questions.map(pub) } });

  const questions: BankQuestion[] = [];
  for (const rc of role.competencies) {
    (BANK[rc.id] ?? []).slice(0, 3).forEach((q, i) => {
      questions.push({ id: `${rc.id}-${i}`, question: q.q, options: q.o, correctIndex: q.c, explanation: q.e, difficulty: q.d, bloom: q.b, competencyId: rc.id });
    });
  }
  if (!questions.length) return NextResponse.json({ error: 'No question bank available for this role.' }, { status: 500 });

  const assessment = { id: uid('ASM'), employeeId: employee.id, role: employee.role, status: 'in-progress' as const, createdAt: new Date().toISOString(), questions };
  await updateDB(data => { data.assessments.push(assessment); });
  return NextResponse.json({ assessment: { id: assessment.id, role: role.title, questions: questions.map(pub) } });
}

function pub(q: BankQuestion) {
  return { id: q.id, question: q.question, options: q.options, competencyId: q.competencyId, difficulty: q.difficulty, bloom: q.bloom };
}
