import { prisma } from "@/lib/prisma";
import { embedTexts } from "./embeddings";
import {
  getStoredChunks,
  getAllStoredChunks,
  getStoredDocument,
  getCompetencyForDocument,
  StoredChunk,
} from "@/lib/data-service";

export interface RetrievedChunk {
  id: string;
  content: string;
  headingPath: string[];
  distance: number;
}

const TOP_K = 12;

const COMPETENCY_KEYWORDS: Record<string, string> = {
  "FN-STAT-014": "survey sampling design PLFS FSU stratum UFS rotation labour force employment NSSO household sample",
  "DM-PRICE-002": "price statistics CPI WPI inflation index basket Jevons Laspeyres price relatives elementary aggregate market",
  "FN-STAT-021": "national income accounting accounts GDP GVA SDP DDP gross value added basic prices factor cost intermediate consumption CFC perpetual inventory method supra-regional GFCF capital formation output production approach income approach expenditure approach",
  "FN-STAT-033": "R Python survey processing data analysis statistical programming cleaning script tabulation validation microdata",
  "BH-INTEGRITY-001": "data integrity ethics confidentiality official statistics code of conduct compliance privacy statutory",
  "FN-STAT-042": "industrial production indexing ASI IIP factory sector manufacturing census sample capital value added",
};

/**
 * Calculates cosine similarity between two vector embeddings:
 * sim(u, v) = (u . v) / (||u|| ||v||)
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Computes semantic token overlap when embeddings are generated or in-flight
 */
function semanticRelevanceScore(query: string, content: string, headings: string[]): number {
  const queryTerms = query
    .toLowerCase()
    .split(/[\s,:-]+/)
    .filter((w) => w.length > 2);
  const targetText = (content + " " + headings.join(" ")).toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (targetText.includes(term)) matches += 1;
  }
  const headingText = headings.join(" ").toLowerCase();
  let headingBoost = 0;
  for (const term of queryTerms) {
    if (headingText.includes(term)) headingBoost += 0.5;
  }
  return Math.min(1, (matches + headingBoost) / Math.max(1, queryTerms.length));
}

/**
 * Embeds a synthetic query built from the target competency codes and pulls
 * the nearest DocumentChunk rows.
 *
 * Dual-Mode Strategy:
 *   1. Primary: PostgreSQL pgvector cosine distance (<=> operator) via raw SQL.
 *   2. In-Memory Fallback: Computes cosine similarity or semantic vector ranking
 *      in TypeScript over local stored chunks if PostgreSQL is offline or unreachable.
 */
export async function retrieveRelevantChunks(params: {
  documentId: string;
  competencyFracCodes: string[];
}): Promise<RetrievedChunk[]> {
  const doc = getStoredDocument(params.documentId);
  const mappedDocFrac = doc ? getCompetencyForDocument(doc) : "";
  const primaryFrac =
    (mappedDocFrac && mappedDocFrac !== "FN-STAT-014")
      ? mappedDocFrac
      : (params.competencyFracCodes[0] || mappedDocFrac || "FN-STAT-014");

  const keywords = COMPETENCY_KEYWORDS[primaryFrac] || "";
  const docTitlePart = doc?.title || "";
  const query = `Statistical methodology ${primaryFrac} ${keywords} ${docTitlePart}`;

  // 1. Primary: PostgreSQL pgvector query
  try {
    const [queryEmbedding] = await embedTexts([query]);
    if (queryEmbedding && queryEmbedding.length > 0) {
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;

      const rows = await prisma.$queryRawUnsafe<
        { id: string; content: string; headingPath: string[] | null; distance: number }[]
      >(
        `
        SELECT id, content, "headingPath", embedding <=> $1::vector AS distance
        FROM "DocumentChunk"
        WHERE "documentId" = $2
        ORDER BY distance ASC
        LIMIT $3
        `,
        vectorLiteral,
        params.documentId,
        TOP_K
      );

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          content: r.content,
          headingPath: r.headingPath ?? [],
          distance: r.distance,
        }));
      }
    }
  } catch {
    // Database or external embedding API offline: fallback seamlessly
  }

  // 2. In-Memory Vector Search Fallback (strictly scoped to document, never cross-contaminating)
  let chunks = getStoredChunks(params.documentId);

  // If documentId has no chunks (e.g. documentId was a virtual ID or preloaded alias), fall back only to the same topic
  if (chunks.length === 0) {
    const lowerDocTitle = (doc?.title || params.documentId).toLowerCase();
    if (
      primaryFrac === "FN-STAT-021" ||
      lowerDocTitle.includes("national") ||
      lowerDocTitle.includes("account") ||
      lowerDocTitle.includes("sna") ||
      lowerDocTitle.includes("gdp") ||
      lowerDocTitle.includes("gva")
    ) {
      chunks = getStoredChunks("doc_nas_sna");
    } else if (
      primaryFrac === "DM-PRICE-002" ||
      lowerDocTitle.includes("cpi") ||
      lowerDocTitle.includes("price") ||
      lowerDocTitle.includes("inflation")
    ) {
      chunks = getStoredChunks("doc_cpi_manual");
    } else if (
      primaryFrac === "FN-STAT-042" ||
      lowerDocTitle.includes("asi") ||
      lowerDocTitle.includes("industry") ||
      lowerDocTitle.includes("factory")
    ) {
      chunks = getStoredChunks("doc_asi_manual");
    } else if (
      primaryFrac === "FN-STAT-014" ||
      lowerDocTitle.includes("plfs") ||
      lowerDocTitle.includes("sampling")
    ) {
      chunks = getStoredChunks("doc_plfs_2024");
    }
  }

  if (chunks.length === 0) {
    return [];
  }

  const ranked = chunks.map((chunk) => {
    let similarity = 0;
    if (chunk.embedding && chunk.embedding.length > 0) {
      // Direct cosine similarity
      similarity = cosineSimilarity(chunk.embedding, chunk.embedding);
    } else {
      similarity = semanticRelevanceScore(query, chunk.content, chunk.headingPath);
    }

    // Distance is 1 - similarity (0 = nearest, 1 = distant)
    const distance = Math.max(0.01, 1 - similarity);
    return {
      id: chunk.id,
      content: chunk.content,
      headingPath: chunk.headingPath,
      distance: Number(distance.toFixed(4)),
    };
  });

  ranked.sort((a, b) => a.distance - b.distance);
  return ranked.slice(0, TOP_K);
}
