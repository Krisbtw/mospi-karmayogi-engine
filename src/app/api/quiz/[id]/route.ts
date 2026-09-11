import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = await getDB();
  const quiz = db.quizzes.find(q => q.id === id);
  if (!quiz) return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
  const full = req.nextUrl.searchParams.get('full') === '1';
  const questions = full ? quiz.questions : quiz.questions.map(q => ({
    id: q.id, question: q.question, options: q.options, difficulty: q.difficulty, bloom: q.bloom,
    type: q.type, competencyId: q.competencyId, sourceDocTitle: q.sourceDocTitle,
    sourceSection: q.sourceSection, chunkIndex: q.chunkIndex, evidence: q.evidence, confidence: q.confidence,
  }));
  return NextResponse.json({ quiz: { ...quiz, questions } });
}
