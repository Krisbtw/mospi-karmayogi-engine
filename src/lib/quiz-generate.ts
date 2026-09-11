import { aiEnabled, llmJSON } from './ai';
import { competencyMap } from './competency-data';
import { retrieve } from './retrieve';
import { STOPWORDS, tokenize } from './embed';
import { uid } from './store';
import { validateAndRepair } from './quiz-validate';
import type { Chunk, Difficulty, DocRecord, GeneratedQuestion, QuizType } from './types';

export interface GenerateOptions {
  doc: DocRecord; chunks: Chunk[]; competencyId: string; count: number;
  difficulty: Difficulty | 'Mixed'; type: QuizType;
}
export interface GenerateResult { questions: GeneratedQuestion[]; mode: 'ai' | 'demo'; note?: string; }

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function splitSentences(text: string): string[] {
  return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

function termStats(chunks: Chunk[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const c of chunks) {
    for (const w of tokenize(c.text)) {
      if (w.length >= 5 && w.length <= 16) freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}

interface SentencePick { sentence: string; term: string; distractors: string[]; }

function pickSentence(chunk: Chunk, freq: Map<string, number>, usedSentences: Set<string>, usedTerms: Set<string>): SentencePick | null {
  const sentences = splitSentences(chunk.text).filter(s => s.length >= 60 && s.length <= 280);
  for (const sentence of sentences) {
    if (usedSentences.has(sentence)) continue;
    const lower = sentence.toLowerCase();
    const words = lower.match(/[a-z][a-z-]+/g) ?? [];
    const candidates = [...new Set(words)]
      .filter(w => w.length >= 6 && !STOPWORDS.has(w) && !usedTerms.has(w) && (freq.get(w) ?? 0) >= 1 && (freq.get(w) ?? 0) <= 12)
      .sort((a, b) => b.length - a.length);
    let term: string | undefined;
    for (const c of candidates) {
      if (lower.split(c).length - 1 === 1) { term = c; break; }
    }
    if (!term) continue;
    const termFreq = freq.get(term) ?? 1;
    const pool = [...freq.entries()]
      .filter(([w, f]) => w !== term && w.length >= 5 && w.length <= 16 && !lower.includes(w) && f <= termFreq + 6)
      .map(([w, f]) => ({ w, score: Math.abs(f - termFreq) * 2 + Math.abs(w.length - term.length) }))
      .sort((a, b) => a.score - b.score)
      .map(x => x.w);
    const distractors: string[] = [];
    for (const w of pool) { if (distractors.length >= 3) break; if (!distractors.includes(w)) distractors.push(w); }
    if (distractors.length < 3) continue;
    return { sentence, term, distractors };
  }
  return null;
}

function buildDeterministicQuestion(pick: SentencePick, chunk: Chunk, doc: DocRecord, competencyId: string, type: QuizType, difficulty: Difficulty, score: number): GeneratedQuestion {
  const blanked = pick.sentence.replace(new RegExp(`\\b${escapeRegExp(pick.term)}\\b`, 'i'), '______');
  const prefix = type === 'MCQ'
    ? `Complete the statement from “${doc.title}”`
    : type === 'Conceptual'
      ? `Concept check (source: ${doc.title}, ${chunk.section})`
      : `Applying the guidance in ${doc.title} (${chunk.section})`;
  const options = [pick.term, ...pick.distractors];
  const rng = mulberry32(hashStr(pick.sentence + pick.term));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const correctIndex = options.indexOf(pick.term);
  const confidence = Math.round(Math.max(0.55, Math.min(0.95, 0.5 + (score || 0.3) * 0.5)) * 100) / 100;
  return {
    id: uid('Q'),
    question: `${prefix}: ${blanked}`,
    options,
    correctIndex,
    explanation: `The source states: “${pick.sentence}” (${doc.title}, ${chunk.section}).`,
    difficulty,
    bloom: type === 'Scenario-based' ? 'Apply' : 'Understand',
    type,
    competencyId,
    sourceDocId: doc.id,
    sourceDocTitle: doc.title,
    sourceSection: chunk.section,
    chunkIndex: chunk.index,
    evidence: pick.sentence,
    confidence,
  };
}

export async function generateQuizQuestions(opts: GenerateOptions): Promise<GenerateResult> {
  const comp = competencyMap.get(opts.competencyId);
  if (!comp) throw new Error('Unknown competency.');
  const docChunks = opts.chunks.filter(c => c.docId === opts.doc.id);
  if (!docChunks.length) throw new Error('This document has no processed content.');

  const query = `${comp.name} ${comp.domain} ${opts.type} ${opts.difficulty === 'Mixed' ? '' : opts.difficulty} question concepts`;
  const retrieved = await retrieve(query, docChunks, Math.max(opts.count * 3, 9));

  const questions: GeneratedQuestion[] = [];
  let aiCount = 0;

  if (aiEnabled()) {
    const blocks = retrieved.map(r => `[[SOURCE ${opts.doc.title} / ${r.chunk.section} / chunk ${r.chunk.index}]]\n${r.chunk.text}`).join('\n\n');
    const system = 'You design competency assessments for government training. Every question MUST be grounded ONLY in the supplied source context. Respond ONLY with JSON: {"questions":[{"question":string,"options":[string,string,string,string],"correctIndex":number,"explanation":string,"difficulty":"Easy"|"Medium"|"Hard","bloom":string,"evidence":string,"sourceSection":string}]}. The "evidence" field must be a verbatim sentence copied from the context. Use the provided section labels exactly; never invent page numbers.';
    const user = `SOURCE CONTEXT:\n${blocks}\n\nGenerate exactly ${opts.count} ${opts.difficulty === 'Mixed' ? 'mixed-difficulty' : opts.difficulty} ${opts.type} questions assessing the competency “${comp.name}”.`;
    const out = await llmJSON<{ questions: unknown[] }>(system, user);
    if (out?.questions?.length) {
      for (const raw of out.questions) {
        if (questions.length >= opts.count) break;
        const q = validateAndRepair(raw, {
          chunks: retrieved.map(r => r.chunk), doc: opts.doc, competencyId: opts.competencyId,
          type: opts.type, defaultDifficulty: opts.difficulty === 'Mixed' ? 'Medium' : opts.difficulty,
        });
        if (q) { questions.push(q); aiCount++; }
      }
    }
  }

  let note: string | undefined;
  if (questions.length < opts.count) {
    const usedSentences = new Set(questions.map(q => q.evidence));
    const usedTerms = new Set(questions.map(q => q.options[q.correctIndex]?.toLowerCase()).filter(Boolean));
    const freq = termStats(docChunks);
    const retrievedIds = new Set(retrieved.map(r => r.chunk.id));
    const ordered = [...retrieved.map(r => r.chunk), ...docChunks.filter(c => !retrievedIds.has(c.id))];
    outer: for (const chunk of ordered) {
      let guard = 0;
      while (questions.length < opts.count && guard < 3) {
        guard++;
        const pick = pickSentence(chunk, freq, usedSentences, usedTerms);
        if (!pick) continue outer;
        usedSentences.add(pick.sentence);
        usedTerms.add(pick.term);
        const difficulty: Difficulty = opts.difficulty === 'Mixed'
          ? (pick.sentence.length < 110 ? 'Easy' : pick.sentence.length < 170 ? 'Medium' : 'Hard')
          : opts.difficulty;
        const score = retrieved.find(r => r.chunk.id === chunk.id)?.score ?? 0.25;
        questions.push(buildDeterministicQuestion(pick, chunk, opts.doc, opts.competencyId, opts.type, difficulty, score));
      }
    }
    if (aiCount > 0) note = 'Some AI output failed source-grounding validation and was replaced by the deterministic generator.';
  }

  const mode: 'ai' | 'demo' = aiCount > 0 && aiCount === questions.length ? 'ai' : 'demo';
  return { questions: questions.slice(0, opts.count), mode, note };
}
