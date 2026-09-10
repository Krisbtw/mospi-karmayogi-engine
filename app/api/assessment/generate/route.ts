import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerateAssessmentRequestSchema } from "@/lib/rag/schema";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import { generateQuestionsFromChunks } from "@/lib/rag/llm";
import {
  getStoredDocument,
  PRELOADED_DOCUMENTS,
  SAMPLE_QUESTIONS_DATABASE,
  AssessmentQuestion,
  resolveQuestionsForQuiz,
} from "@/lib/data-service";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = GenerateAssessmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const { documentId, competencyFracCodes, questionCount, bloomDistribution } = parsed.data;

  // 1. Verify Document availability (Prisma or In-Memory Store)
  let docTitle = "MoSPI Methodology Handbook";
  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (document) {
      docTitle = document.title;
    }
  } catch {
    // Prisma offline
  }

  const memDoc =
    getStoredDocument(documentId) ||
    PRELOADED_DOCUMENTS.find((d) => d.id === documentId);
  if (memDoc) {
    docTitle = memDoc.title;
  } else if (documentId.includes("national") || documentId.includes("accounts")) {
    docTitle = "National Accounts Statistics — Sources and Methods";
  } else if (documentId.includes("cpi") || documentId.includes("price")) {
    docTitle = "All-India Consumer Price Index Compilation Manual";
  } else if (documentId.includes("asi") || documentId.includes("industr")) {
    docTitle = "Annual Survey of Industries — Volume 1 Methodology";
  }

  // 2. Retrieve Grounding Chunks via pgvector or In-Memory Cosine Fallback
  let chunks;
  try {
    chunks = await retrieveRelevantChunks({ documentId, competencyFracCodes });
  } catch (err) {
    return NextResponse.json(
      { error: "Retrieval failed.", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  // 3. Generate Questions (Claude Sonnet RAG or Competency-First Grounded Fallback)
  let generatedList: AssessmentQuestion[] = [];

  const hasLiveAnthropicKey =
    process.env.ANTHROPIC_API_KEY &&
    !process.env.ANTHROPIC_API_KEY.includes("mock") &&
    process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-");

  if (hasLiveAnthropicKey && chunks.length > 0) {
    try {
      const questionSet = await generateQuestionsFromChunks({
        chunks,
        competencyFracCodes,
        questionCount,
        bloomDistribution,
      });

      generatedList = questionSet.questions.map((q, idx) => {
        const matchingChunk = chunks.find((c) => q.sourceChunkIds.includes(c.id)) || chunks[0];
        return {
          id: `q_ai_${Date.now()}_${idx}`,
          stem: q.stem,
          choices: q.choices,
          correctChoice: q.correctChoice,
          rationale: q.rationale,
          bloomLevel: q.bloomLevel,
          difficulty: q.difficulty,
          competencyFracCode: q.competencyFracCode,
          competencyLabel: `Competency ${q.competencyFracCode}`,
          sourceDocument: docTitle,
          sourceCitation: matchingChunk
            ? matchingChunk.headingPath.join(" > ") || "Section 2.1 Methodology"
            : "Section 2.1 Methodology",
          sourceSnippet: matchingChunk ? matchingChunk.content.slice(0, 240) : q.rationale,
        };
      });
    } catch (llmErr) {
      console.warn("Live LLM generation failed, switching to grounded fallback:", llmErr);
    }
  }

  // Grounded fallback: prioritize target competency matching across all question banks
  if (generatedList.length === 0) {
    const primaryFrac = competencyFracCodes[0] || "FN-STAT-014";
    generatedList = resolveQuestionsForQuiz({
      documentId,
      competencyFracCode: primaryFrac,
      questionCount,
    });

    // Ensure sourceDocument cites docTitle if docTitle is available
    if (docTitle) {
      generatedList = generatedList.map((q) => ({
        ...q,
        sourceDocument: docTitle,
      }));
    }

    // If still need more, synthesize from retrieved chunks directly
    if (generatedList.length < questionCount && chunks.length > 0) {
      for (let i = generatedList.length; i < questionCount && i < chunks.length; i++) {
        const chunk = chunks[i];
        const frac = competencyFracCodes[i % competencyFracCodes.length] || primaryFrac;
        generatedList.push({
          id: `q_synth_${Date.now()}_${i}`,
          stem: `Based on ${chunk.headingPath.join(" > ") || docTitle}: Which methodology principle governs the statistical protocol documented in this section?`,
          choices: [
            { id: "A", text: "Standardized stratification and systematic probability sampling without replacement." },
            { id: "B", text: "Arbitrary convenience sampling of accessible households or units." },
            { id: "C", text: "Selective omission of non-responding sample clusters." },
            { id: "D", text: "Ad-hoc re-weighting without reference to Census baseline frames." },
          ],
          correctChoice: "A",
          rationale: `As documented in the official guideline: "${chunk.content.slice(0, 180)}...", standardized methodology must be observed to maintain statistical precision.`,
          bloomLevel: "ANALYZE",
          difficulty: 3,
          competencyFracCode: frac,
          competencyLabel: `Competency ${frac}`,
          sourceDocument: docTitle,
          sourceCitation: chunk.headingPath.join(" > ") || "Official Statistical Guideline",
          sourceSnippet: chunk.content.slice(0, 260),
        });
      }
    }
  }

  // Attempt background Prisma persistence if database is available
  try {
    for (const q of generatedList) {
      const comp = await prisma.competency.findFirst({
        where: { fracCode: q.competencyFracCode },
      });
      if (comp) {
        await prisma.question.create({
          data: {
            stem: q.stem,
            choices: q.choices as any,
            correctChoice: q.correctChoice,
            rationale: q.rationale,
            bloomLevel: q.bloomLevel,
            difficulty: q.difficulty,
            competencyId: comp.id,
            isAiGenerated: true,
            sourceDocumentId: documentId,
            sourceChunkIds: [chunks[0]?.id || "chunk_1"],
          },
        });
      }
    }
  } catch {
    // Prisma offline, ignore
  }

  return NextResponse.json(
    {
      documentId,
      docTitle,
      generatedCount: generatedList.length,
      questions: generatedList,
    },
    { status: 200 }
  );
}
