import { NextRequest, NextResponse } from 'next/server';
import { COMPETENCIES, IGOT_CATALOG, roleMap } from '@/lib/competency-data';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ groups: [] });
  const db = await getDB();
  const terms = q.split(/\s+/);
  const score = (text: string) => terms.filter(t => text.includes(t)).length;

  const employees = db.employees
    .map(e => ({ s: score(`${e.name} ${roleMap.get(e.role)?.title ?? ''} ${e.department} ${e.designation}`.toLowerCase()), title: e.name, subtitle: `${roleMap.get(e.role)?.title ?? ''} · ${e.department}`, href: '/dashboard', employeeId: e.id }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
  const competencies = COMPETENCIES
    .map(c => ({ s: score(`${c.name} ${c.domain}`.toLowerCase()), title: c.name, subtitle: c.domain, href: '/gaps' }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
  const courses = IGOT_CATALOG
    .map(c => ({ s: score(c.title.toLowerCase()), title: c.title, subtitle: `${c.level} · ${c.hours} h · ${c.provider}`, href: '/path' }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
  const documents = db.documents
    .map(d => ({ s: score(d.title.toLowerCase()), title: d.title, subtitle: `${d.kind.toUpperCase()} · ${d.chunkCount} chunks`, href: '/quiz' }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
  const quizzes = db.quizzes
    .map(z => ({ s: score(z.title.toLowerCase()), title: z.title, subtitle: `${z.mode.toUpperCase()} · ${z.questions.length} questions`, href: `/quiz/attempt/${z.id}` }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);

  const groups = [
    { name: 'Employees', items: employees },
    { name: 'Competencies', items: competencies },
    { name: 'Courses', items: courses },
    { name: 'Documents', items: documents },
    { name: 'Quizzes', items: quizzes },
  ].filter(g => g.items.length > 0);
  return NextResponse.json({ groups });
}
