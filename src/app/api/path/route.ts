import { NextRequest, NextResponse } from 'next/server';
import { buildPath } from '@/lib/path';
import { igotMode } from '@/lib/igot';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'employeeId is required.' }, { status: 400 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  const states = db.competencies.filter(s => s.employeeId === employeeId);
  const phases = buildPath(employee, states, db.courses, db.enrollments);
  const completed = db.courses.filter(c => c.employeeId === employeeId);
  return NextResponse.json({ phases, completed, mode: igotMode() });
}
