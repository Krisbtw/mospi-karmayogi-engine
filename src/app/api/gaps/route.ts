import { NextRequest, NextResponse } from 'next/server';
import { buildGapRows, gapExplanation } from '@/lib/gap';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  const states = db.competencies.filter(s => s.employeeId === employeeId);
  const assessed = states.length > 0;
  const rows = buildGapRows(states, employee.role);
  const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.current, 0) / rows.length) : 0;
  const latest = [...db.assessments].filter(a => a.employeeId === employeeId && a.status === 'completed').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0] ?? null;
  let explanation: string | null = null;
  let explanationSource: 'ai' | 'data' | null = null;
  if (assessed) {
    const exp = await gapExplanation(employee, rows, overall, latest?.completedAt ?? null);
    explanation = exp.text; explanationSource = exp.source;
  }
  return NextResponse.json({ assessed, overall, rows, explanation, explanationSource, latestAssessment: latest ? { overall: latest.overall ?? 0, completedAt: latest.completedAt ?? latest.createdAt } : null });
}
