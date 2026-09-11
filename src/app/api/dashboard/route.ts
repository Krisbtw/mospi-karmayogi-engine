import { NextRequest, NextResponse } from 'next/server';
import { roleMap } from '@/lib/competency-data';
import { buildGapRows } from '@/lib/gap';
import { buildPath } from '@/lib/path';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  const states = db.competencies.filter(s => s.employeeId === employeeId);
  const rows = buildGapRows(states, employee.role);
  const assessed = states.length > 0;
  const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.current, 0) / rows.length) : 0;
  const history = db.courses.filter(c => c.employeeId === employeeId);
  const phases = buildPath(employee, states, db.courses, db.enrollments);
  const items = phases.flatMap(p => p.items);
  const latest = [...db.assessments].filter(a => a.employeeId === employeeId && a.status === 'completed').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0] ?? null;
  const lastQuiz = [...db.attempts].filter(a => a.employeeId === employeeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  return NextResponse.json({
    employee: { id: employee.id, name: employee.name, role: roleMap.get(employee.role)?.title ?? employee.role, department: employee.department, designation: employee.designation },
    assessed, overall,
    criticalCount: rows.filter(r => r.priority === 'Critical' || r.priority === 'High').length,
    topGaps: rows.filter(r => r.gap > 0).slice(0, 3),
    recommended: items.filter(i => i.status === 'Recommended').length,
    inProgress: items.filter(i => i.status === 'In Progress').length,
    completedCourses: history.length,
    learningHours: history.reduce((s, c) => s + c.hours, 0),
    latestAssessment: latest ? { overall: latest.overall ?? 0, completedAt: latest.completedAt ?? latest.createdAt } : null,
    lastQuiz: lastQuiz ? { percent: lastQuiz.percent, before: lastQuiz.before, after: lastQuiz.after, improvement: lastQuiz.improvement } : null,
  });
}
