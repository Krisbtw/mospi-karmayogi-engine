import { NextRequest, NextResponse } from 'next/server';
import { competencyMap } from '@/lib/competency-data';
import { buildGapRows } from '@/lib/gap';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  const states = db.competencies.filter(s => s.employeeId === employeeId);
  const events = db.events
    .filter(e => e.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(e => ({ id: e.id, type: e.type, competencyName: competencyMap.get(e.competencyId)?.name ?? e.competencyId, before: e.before, after: e.after, detail: e.detail, createdAt: e.createdAt }));
  return NextResponse.json({
    courses: db.courses.filter(c => c.employeeId === employeeId),
    rows: buildGapRows(states, employee.role),
    events,
  });
}
