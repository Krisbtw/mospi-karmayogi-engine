import { embedText, cosine } from './embed';
import type { Chunk } from './types';

/**
 * RULE 11 FIX: similarity is computed between the QUERY embedding and each
 * CHUNK embedding — never chunk-vs-itself. No fake 100% scores.
 */
export async function retrieve(query: string, chunks: Chunk[], topK: number): Promise<{ chunk: Chunk; score: number }[]> {
  const qv = await embedText(query);
  return chunks
    .map(c => ({ chunk: c, score: cosine(qv, c.embedding) }))
    .filter(r => r.score > 0.01)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
