import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { courseById } from '@/lib/competency-data';
import { igotMode, igotRemote } from '@/lib/igot';
import { getDB, uid, updateDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

const Body = z.object({ employeeId: z.string().min(1), courseId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'employeeId and courseId are required.' }, { status: 400 });
  const { employeeId, courseId } = parsed.data;
  const course = courseById(courseId);
  if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  const db = await getDB();
  if (!db.employees.some(e => e.id === employeeId)) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });

  const mode = igotMode();
  const remoteOk = mode === 'live' ? await igotRemote('/enrollments', { courseId, employeeId }) : false;
  const now = new Date().toISOString();
  await updateDB(data => {
    if (!data.enrollments.some(e => e.employeeId === employeeId && e.courseId === courseId)) {
      data.enrollments.push({ employeeId, courseId, status: 'enrolled', enrolledAt: now });
    }
    data.events.push({
      id: uid('EV'), employeeId, competencyId: course.competencyId, type: 'enrollment',
      detail: `Enrolled in “${course.title}” on iGOT${mode === 'live' && remoteOk ? '' : ' (demo mode — recorded locally)'}`,
      createdAt: now,
    });
  });
  const note = mode === 'demo'
    ? 'Demo mode: enrollment recorded locally. Set IGOT_API_BASE and IGOT_API_KEY for live iGOT enrollment.'
    : remoteOk ? 'Enrollment sent to iGOT.' : 'Live iGOT call failed — enrollment recorded locally.';
  return NextResponse.json({ mode, remoteOk, note });
}
