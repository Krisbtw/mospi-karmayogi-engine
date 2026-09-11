import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { competencyMap } from '@/lib/competency-data';
import { generateQuizQuestions } from '@/lib/quiz-generate';
import { getDB, uid, updateDB } from '@/lib/store';
import type { Quiz } from '@/lib/types';

export const dynamic = 'force-dynamic';

const Body = z.object({
  documentId: z.string().min(1),
  competencyId: z.string().refine(id => competencyMap.has(id), 'Unknown competency'),
  count: z.number().int().min(1).max(10),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']),
  type: z.enum(['MCQ', 'Conceptual', 'Scenario-based']),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
    const { documentId, competencyId, count, difficulty, type } = parsed.data;
    const db = await getDB();
    const doc = db.documents.find(d => d.id === documentId);
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });

    const result = await generateQuizQuestions({ doc, chunks: db.chunks, competencyId, count, difficulty, type });
    if (!result.questions.length) {
      return NextResponse.json({ error: 'Could not generate source-grounded questions from this document — try another document or competency.' }, { status: 422 });
    }
    const quiz: Quiz = {
      id: uid('QZ'), title: `${competencyMap.get(competencyId)!.name} — ${doc.title}`,
      documentId: doc.id, competencyId, mode: result.mode,
      createdAt: new Date().toISOString(), questions: result.questions,
    };
    await updateDB(data => { data.quizzes.push(quiz); });
    return NextResponse.json({ quiz, generated: result.questions.length, mode: result.mode, note: result.note });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Quiz generation failed.' }, { status: 500 });
  }
}
