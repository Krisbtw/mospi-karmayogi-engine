/**
 * Semantic-boundary-preserving chunker for official statistical
 * methodology documents (PLFS Handbook, CPI/WPI methodology notes, ASI
 * instruction manuals, National Accounts sources-and-methods volumes).
 *
 * Naive fixed-size chunking cuts mid-formula or mid-definition, which is
 * exactly the content an MCQ needs intact. This chunker instead:
 *   1. Splits on structural boundaries first (numbered clauses, headings,
 *      paragraph breaks) so a chunk never straddles two clauses.
 *   2. Packs consecutive small sections up to a target token budget.
 *   3. Falls back to a sliding window with overlap only for pathological
 *      single blocks that exceed the max chunk size on their own.
 */

export interface RawChunk {
  ordinal: number;
  content: string;
  approxTokens: number;
  headingPath: string[]; // e.g. ["Chapter 4: Sampling Design", "4.3 Stratification"]
}

const TARGET_TOKENS = 450; // ~ optimal recall/precision tradeoff for embedding retrieval
const MAX_TOKENS = 700;
const OVERLAP_TOKENS = 60;

// Coarse but fast token estimate (avoids pulling in a tokenizer dependency
// for a chunking pre-pass). ~4 chars/token is a standard English-text ratio.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Matches methodology-document heading conventions: "4.3 Stratification",
// "Chapter 4:", "Annexure II", "Box 3.1", all-caps section titles.
const HEADING_PATTERN =
  /^(chapter\s+\d+|annexure\s+[ivxlc\d]+|box\s+\d+(\.\d+)?|\d+(\.\d+)*\s+[A-Z].{2,80}|[A-Z][A-Z\s]{6,60})\s*$/;

function splitIntoSections(rawText: string): { heading: string | null; body: string }[] {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const sections: { heading: string | null; body: string }[] = [];
  let currentHeading: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body.length > 0) {
      sections.push({ heading: currentHeading, body });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (HEADING_PATTERN.test(line.trim())) {
      flush();
      currentHeading = line.trim();
    } else {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}

function slidingWindowSplit(body: string): string[] {
  const words = body.split(/\s+/);
  const wordsPerChunk = TARGET_TOKENS; // ~1 token/word approximation, good enough here
  const overlapWords = OVERLAP_TOKENS;
  const parts: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
    parts.push(words.slice(i, i + wordsPerChunk).join(" "));
    if (i + wordsPerChunk >= words.length) break;
  }
  return parts;
}

export function chunkDocument(rawText: string): RawChunk[] {
  const sections = splitIntoSections(rawText);
  const chunks: RawChunk[] = [];
  const headingStack: string[] = [];

  let bufferText = "";
  let bufferHeadings: string[] = [];
  let ordinal = 0;

  const flushBuffer = () => {
    if (bufferText.trim().length === 0) return;
    chunks.push({
      ordinal: ordinal++,
      content: bufferText.trim(),
      approxTokens: estimateTokens(bufferText),
      headingPath: [...bufferHeadings],
    });
    bufferText = "";
  };

  for (const section of sections) {
    if (section.heading) {
      // A new top-level heading always starts a fresh chunk group so a
      // question's context never silently crosses a section boundary.
      if (/^chapter\s+\d+/i.test(section.heading) || /^annexure/i.test(section.heading)) {
        flushBuffer();
        headingStack.length = 0;
        headingStack.push(section.heading);
      } else {
        if (estimateTokens(bufferText) + estimateTokens(section.heading) > MAX_TOKENS) {
          flushBuffer();
        }
        headingStack[1] = section.heading;
      }
    }

    const sectionTokens = estimateTokens(section.body);

    if (sectionTokens > MAX_TOKENS) {
      // Oversized single section (dense formula/table block): flush what
      // we have, then window across just this section with overlap.
      flushBuffer();
      for (const part of slidingWindowSplit(section.body)) {
        chunks.push({
          ordinal: ordinal++,
          content: part,
          approxTokens: estimateTokens(part),
          headingPath: [...headingStack],
        });
      }
      continue;
    }

    if (estimateTokens(bufferText) + sectionTokens > TARGET_TOKENS && bufferText.length > 0) {
      flushBuffer();
    }

    bufferText += (bufferText ? "\n\n" : "") + section.body;
    bufferHeadings = [...headingStack];
  }

  flushBuffer();
  return chunks;
}
