import type { Chunk } from './types';
import type { TextSection } from './extract';

const SIZE = 700;
const OVERLAP = 80;

export function chunkSections(sections: TextSection[], docId: string, docTitle: string): Omit<Chunk, 'embedding'>[] {
  const chunks: Omit<Chunk, 'embedding'>[] = [];
  for (const s of sections) {
    const clean = s.text.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    let start = 0, idx = 0;
    while (start < clean.length) {
      let end = Math.min(start + SIZE, clean.length);
      if (end < clean.length) {
        const dot = clean.lastIndexOf('.', end);
        if (dot > start + SIZE / 2) end = dot + 1;
      }
      const text = clean.slice(start, end).trim();
      if (text) chunks.push({ id: `${docId}:${s.label}:${idx}`, docId, docTitle, section: s.label, index: idx, text });
      idx++;
      if (end >= clean.length) break;
      start = Math.max(end - OVERLAP, start + 1);
    }
  }
  return chunks;
}
