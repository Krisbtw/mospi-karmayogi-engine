import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { competencyMap, courseById } from '@/lib/competency-data';
import { igotMode, igotRemote } from '@/lib/igot';
import { courseGain } from '@/lib/scoring';
import { getDB, uid, updateDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

const Body = z.object({
  employeeId: z.string().min(1),
  courseId: z.string().min(1),
  score: z.number().int().min(0).max(100).default(85),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  const { employeeId, courseId, score } = parsed.data;
  const course = courseById(courseId);
  if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  const db = await getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });

  const mode = igotMode();
  const remoteOk = mode === 'live' ? await igotRemote('/completions', { courseId, employeeId, score }) : false;
  const state = db.competencies.find(s => s.employeeId === employeeId && s.competencyId === course.competencyId);
  const before = state?.current ?? 0;
  const gain = courseGain(before, score, course.hours);
  const after = before + gain;
  const now = new Date().toISOString();

  await updateDB(data => {
    const s = data.competencies.find(x => x.employeeId === employeeId && x.competencyId === course.competencyId);
    if (s) { s.current = after; s.updatedAt = now; }
    else data.competencies.push({ employeeId, competencyId: course.competencyId, current: after, updatedAt: now });
    data.courses.push({
      employeeId, title: course.title, provider: course.provider, competencyId: course.competencyId,
      completedOn: now.slice(0, 10), score, certificate: score >= 70, hours: course.hours,
      source: mode === 'live' && remoteOk ? 'igot-live' : 'igot-demo',
    });
    const enr = data.enrollments.find(e => e.employeeId === employeeId && e.courseId === courseId);
    if (enr) enr.status = 'completed';
    data.events.push({
      id: uid('EV'), employeeId, competencyId: course.competencyId, type: 'course-completion',
      before, after, detail: `Completed “${course.title}” on iGOT — score ${score}%${mode === 'live' && remoteOk ? '' : ' (demo mode)'}`,
      createdAt: now,
    });
  });
  return NextResponse.json({
    before, after, improvement: gain,
    competencyName: competencyMap.get(course.competencyId)?.name ?? course.competencyId,
    mode, remoteOk,
  });
}
