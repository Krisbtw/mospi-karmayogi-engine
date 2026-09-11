import { NextResponse } from 'next/server';
import { competencyMap, IGOT_CATALOG, roleMap } from '@/lib/competency-data';
import { buildGapRows } from '@/lib/gap';
import { buildPath } from '@/lib/path';
import { igotCourseUrl } from '@/lib/igot';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDB();
  const summaries = db.employees.map(emp => {
    const states = db.competencies.filter(s => s.employeeId === emp.id);
    const rows = buildGapRows(states, emp.role);
    const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.current, 0) / rows.length) : null;
    const critical = rows.filter(r => r.priority === 'Critical' || r.priority === 'High').length;
    const lastEvent = [...db.events].filter(e => e.employeeId === emp.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt ?? null;
    return { emp, rows, overall, critical, lastEvent, assessed: states.length > 0 };
  });
  const assessed = summaries.filter(s => s.assessed);
  const avgCompetency = assessed.length ? Math.round(assessed.reduce((s, e) => s + (e.overall ?? 0), 0) / assessed.length) : null;

  const counts = new Map<string, { name: string; count: number; gapSum: number }>();
  for (const s of assessed) {
    for (const r of s.rows) {
      if (r.priority === 'Critical' || r.priority === 'High') {
        const rec = counts.get(r.competencyId) ?? { name: r.name, count: 0, gapSum: 0 };
        rec.count++; rec.gapSum += r.gap;
        counts.set(r.competencyId, rec);
      }
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1].count - a[1].count)[0] ?? null;
  const courseList = top ? IGOT_CATALOG.filter(c => c.competencyId === top[0]) : [];
  const suggested = courseList.find(c => c.level === 'Intermediate') ?? courseList[0] ?? null;

  let recommended = 0;
  for (const s of assessed) {
    recommended += buildPath(s.emp, db.competencies.filter(x => x.employeeId === s.emp.id), db.courses, db.enrollments)
      .reduce((sum, p) => sum + p.items.length, 0);
  }
  const quizEvents = db.events.filter(e => e.type === 'ai-quiz');
  const avgImprovement = quizEvents.length ? Math.round(quizEvents.reduce((s, e) => s + ((e.after ?? 0) - (e.before ?? 0)), 0) / quizEvents.length) : null;

  return NextResponse.json({
    assessedCount: assessed.length,
    totalEmployees: db.employees.length,
    avgCompetency,
    topRequirement: top ? { competencyId: top[0], name: top[1].name, employees: top[1].count, avgGap: Math.round(top[1].gapSum / top[1].count) } : null,
    suggestedCourse: suggested ? { title: suggested.title, level: suggested.level, hours: suggested.hours, provider: suggested.provider, url: igotCourseUrl(suggested.title) } : null,
    learningDemand: { recommended, enrolled: db.enrollments.filter(e => e.status === 'enrolled').length },
    improvement: { avg: avgImprovement, samples: quizEvents.length },
    employees: summaries.map(s => ({
      id: s.emp.id, name: s.emp.name, department: s.emp.department, designation: s.emp.designation,
      role: roleMap.get(s.emp.role)?.title ?? s.emp.role, overall: s.overall, critical: s.critical,
      assessed: s.assessed, lastEvent: s.lastEvent,
    })),
    competencyNames: Object.fromEntries([...competencyMap.entries()].map(([k, v]) => [k, v.name])),
  });
}
