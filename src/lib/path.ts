import { buildGapRows } from './gap';
import { IGOT_CATALOG } from './competency-data';
import { igotCourseUrl } from './igot';
import type { CompetencyState, CourseRecord, Employee, Enrollment, PathItem, PathPhase } from './types';

const LEVEL_RANK: Record<string, number> = { Foundation: 1, Intermediate: 2, Advanced: 3 };

export function buildPath(employee: Employee, states: CompetencyState[], history: CourseRecord[], enrollments: Enrollment[]): PathPhase[] {
  const rows = buildGapRows(states, employee.role);
  const completedTitles = new Set(history.filter(h => h.employeeId === employee.id).map(h => h.title));
  const enrolled = new Set(enrollments.filter(e => e.employeeId === employee.id && e.status === 'enrolled').map(e => e.courseId));
  const items: PathItem[] = [];
  for (const row of rows) {
    if (row.gap <= 0) continue;
    const courses = IGOT_CATALOG.filter(c => c.competencyId === row.competencyId && !completedTitles.has(c.title));
    for (const c of courses.slice(0, 2)) {
      items.push({
        courseId: c.id, title: c.title, provider: c.provider, level: c.level,
        levelRank: LEVEL_RANK[c.level], difficulty: c.difficulty, hours: c.hours,
        competencyId: row.competencyId, competencyName: row.name,
        current: row.current, required: row.required,
        status: enrolled.has(c.id) ? 'In Progress' : 'Recommended',
        url: igotCourseUrl(c.title),
      });
    }
  }
  return [
    { name: 'Phase 1 · Fundamentals', description: 'Build the foundations for your weakest competencies first.', items: items.filter(i => i.levelRank === 1).slice(0, 4) },
    { name: 'Phase 2 · Core Skills', description: 'Strengthen the core methods required for the role.', items: items.filter(i => i.levelRank === 2).slice(0, 4) },
    { name: 'Phase 3 · Applied Practice', description: 'Apply the skills at an advanced level.', items: items.filter(i => i.levelRank === 3).slice(0, 4) },
    { name: 'Phase 4 · Assessment', description: 'Reassess and close the loop with a source-grounded AI quiz.', items: [], cta: 'assessment' },
  ];
}
