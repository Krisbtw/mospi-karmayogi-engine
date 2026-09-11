import { llmEmbedding } from './ai';

export const EMBED_DIM = 256;
export const STOPWORDS = new Set([
  'about', 'above', 'after', 'again', 'along', 'also', 'among', 'and', 'any', 'are', 'because', 'been',
  'before', 'being', 'below', 'between', 'both', 'but', 'could', 'did', 'does', 'doing', 'down', 'during',
  'each', 'either', 'every', 'first', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'here',
  'into', 'its', 'itself', 'just', 'more', 'most', 'only', 'other', 'others', 'over', 'same', 'should',
  'some', 'such', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'will',
  'with', 'within', 'without', 'would', 'your', 'every', 'value', 'values', 'using', 'based', 'given',
  'against', 'upon', 'onto', 'second', 'third', 'must', 'shall', 'many', 'much', 'upon', 'whose', 'which',
]);

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]*/g) ?? []).filter(w => !STOPWORDS.has(w));
}

/** Deterministic lexical fallback embedding (hashed bag-of-words, L2-normalised). */
export function lexicalEmbed(text: string): number[] {
  const v = new Array<number>(EMBED_DIM).fill(0);
  const words = text.toLowerCase().match(/[a-z][a-z0-9-]*/g) ?? [];
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
  for (const [w, f] of tf) { v[fnv1a(w) % EMBED_DIM] += 1 + Math.log(f); }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / norm);
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function embedText(text: string): Promise<number[]> {
  const r = await llmEmbedding([text]);
  return r?.[0] ?? lexicalEmbed(text);
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const r = await llmEmbedding(texts);
  return r ?? texts.map(lexicalEmbed);
}
