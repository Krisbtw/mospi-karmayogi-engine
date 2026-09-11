import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEPARTMENTS, ROLES } from '@/lib/competency-data';
import { getDB, updateDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDB();
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const employee = db.employees.find(e => e.id === id);
    if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
    return NextResponse.json({ employee });
  }
  return NextResponse.json({ employees: db.employees.map(e => ({ id: e.id, name: e.name, role: e.role })) });
}

const Body = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(2).max(80),
  department: z.string().min(2),
  designation: z.string().min(2),
  role: z.string().refine(id => ROLES.some(r => r.id === id), 'Unknown role'),
  yearsExperience: z.number().int().min(0).max(45),
  location: z.string().min(1).max(60),
  functionalArea: z.string().min(1).max(60),
  cadreRank: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  const d = parsed.data;
  const dept = DEPARTMENTS.find(x => x.name === d.department);
  const desig = dept?.designations.find(x => x.title === d.designation);
  if (!dept || !desig || !desig.roles.includes(d.role)) {
    return NextResponse.json({ error: 'Department / designation / role combination is not valid.' }, { status: 400 });
  }
  const db = await updateDB(data => {
    const emp = data.employees.find(e => e.id === d.employeeId);
    if (emp) Object.assign(emp, { ...d, employeeId: undefined });
  });
  const employee = db.employees.find(e => e.id === d.employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
  return NextResponse.json({ employee });
}
