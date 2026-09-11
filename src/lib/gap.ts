import { competencyMap, roleMap } from './competency-data';
import { aiEnabled, llmJSON } from './ai';
import type { CompetencyState, Employee, GapRow, Priority } from './types';

export function priorityOf(gap: number): Priority {
  if (gap <= 0) return 'Complete';
  if (gap >= 30) return 'Critical';
  if (gap >= 20) return 'High';
  if (gap >= 10) return 'Medium';
  return 'Low';
}

const RANK: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Complete: 4 };

export function buildGapRows(states: CompetencyState[], roleId: string): GapRow[] {
  const role = roleMap.get(roleId);
  if (!role) return [];
  const cur = new Map(states.map(s => [s.competencyId, s.current]));
  return role.competencies
    .map(rc => {
      const def = competencyMap.get(rc.id)!;
      const current = cur.get(rc.id) ?? 0;
      const gap = Math.round(rc.required - current);
      return {
        competencyId: rc.id, name: def.name, domain: def.domain,
        required: rc.required, current, gap: Math.max(0, gap), priority: priorityOf(gap),
      } satisfies GapRow;
    })
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || b.gap - a.gap);
}

export function gapExplanationText(employee: Employee, rows: GapRow[], overall: number, assessedOn: string | null): string {
  const role = roleMap.get(employee.role);
  const open = rows.filter(r => r.gap > 0);
  const crit = rows.filter(r => r.priority === 'Critical' || r.priority === 'High');
  const best = [...rows].sort((a, b) => b.current - a.current)[0];
  const worst = open[0];
  const second = open[1];
  const parts: string[] = [
    `${employee.name} (${role?.title ?? employee.role}, ${employee.department}) assessed at ${overall}% overall${assessedOn ? ` on ${assessedOn.slice(0, 10)}` : ''}, with ${employee.yearsExperience} years of experience in ${employee.functionalArea}.`,
    `${open.length} of ${rows.length} role competencies are below required proficiency; ${crit.length} are at Critical/High priority.`,
    worst ? `The highest-priority gap is ${worst.name}: current ${worst.current}% against required ${worst.required}% (${worst.gap} percentage points).` : '',
    second ? `This is followed by ${second.name} (${second.current}% vs ${second.required}%).` : '',
    best ? `The strongest area is ${best.name} at ${best.current}%.` : '',
    worst ? `Priority learning should begin with ${worst.name}${second ? `, then ${second.name}` : ''}, before reassessment to confirm closure.` : 'All role competencies are at or above required proficiency — reassess after the next role change or refresher training.',
  ];
  return parts.filter(Boolean).join(' ');
}

export async function gapExplanation(employee: Employee, rows: GapRow[], overall: number, assessedOn: string | null): Promise<{ text: string; source: 'ai' | 'data' }> {
  const fallback = gapExplanationText(employee, rows, overall, assessedOn);
  if (aiEnabled()) {
    const out = await llmJSON<{ explanation: string }>(
      'You are a competency analyst for government training. Using ONLY the data provided, write a concise (4–6 sentence) explanation of the employee’s competency gaps. Reference the actual numbers. No generic filler.',
      JSON.stringify({ employee: { name: employee.name, role: roleMap.get(employee.role)?.title, department: employee.department, yearsExperience: employee.yearsExperience, functionalArea: employee.functionalArea }, overall, assessedOn, gaps: rows }),
    );
    if (out?.explanation && out.explanation.length > 60) return { text: out.explanation, source: 'ai' };
  }
  return { text: fallback, source: 'data' };
}
