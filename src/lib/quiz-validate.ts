import { z } from 'zod';
import type { Chunk, DocRecord, Difficulty, GeneratedQuestion, QuizType } from './types';
import { uid } from './store';

export const RawQuestionSchema = z.object({
  question: z.string().min(12).max(600),
  options: z.array(z.string().min(1).max(300)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(20).max(1200),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  bloom: z.string().max(40).optional(),
  evidence: z.string().min(30).max(1200),
  sourceSection: z.string().max(120).optional(),
});

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** RULE 14: evidence must actually be grounded in a provided source chunk. */
export function evidenceMatches(evidence: string, chunkText: string): boolean {
  const ev = normalize(evidence);
  const ct = normalize(chunkText);
  if (ct.includes(ev)) return true;
  const words = ev.split(' ').filter(w => w.length > 3);
  if (words.length < 5) return false;
  const hits = words.filter(w => ct.includes(w)).length;
  return hits / words.length >= 0.8;
}

export interface RepairCtx { chunks: Chunk[]; doc: DocRecord; competencyId: string; type: QuizType; defaultDifficulty: Difficulty; }

export function validateAndRepair(raw: unknown, ctx: RepairCtx): GeneratedQuestion | null {
  const parsed = RawQuestionSchema.safeParse(raw);
  if (!parsed.success) return null;
  const q = parsed.data;
  if (new Set(q.options.map(o => o.trim().toLowerCase())).size !== 4) return null;
  if (!q.options[q.correctIndex]?.trim()) return null;
  const match = ctx.chunks.find(c => evidenceMatches(q.evidence, c.text));
  if (!match) return null; // not grounded in the source — reject rather than show
  return {
    id: uid('Q'),
    question: q.question.trim(),
    options: q.options.map(o => o.trim()),
    correctIndex: q.correctIndex,
    explanation: q.explanation.trim(),
    difficulty: q.difficulty,
    bloom: q.bloom?.trim() || 'Understand',
    type: ctx.type,
    competencyId: ctx.competencyId,
    sourceDocId: ctx.doc.id,
    sourceDocTitle: ctx.doc.title,
    sourceSection: q.sourceSection?.trim() || match.section,
    chunkIndex: match.index,
    evidence: match.text.length <= 500 ? match.text : q.evidence.trim(),
    confidence: 0.9,
  };
}
