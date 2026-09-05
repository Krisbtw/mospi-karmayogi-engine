import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerateAssessmentRequestSchema } from "@/lib/rag/schema";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";
import { generateQuestionsFromChunks } from "@/lib/rag/llm";

export const runtime = "nodejs";
export const maxDuration = 120; // MCQ generation over long methodology docs can take a while

/**
 * POST /api/assessment/generate
 *
 * Body: { documentId, competencyFracCodes[], questionCount?, bloomDistribution?, cadreRank? }
 *
 * Pipeline:
 *   1. Validate request shape (Zod).
 *   2. Confirm the Document exists and has finished embedding (status READY).
 *   3. Retrieve the most relevant chunks for the requested competencies
 *      (pgvector cosine similarity).
 *   4. Call the LLM with those chunks as grounding context, requesting
 *      strict JSON matching GeneratedQuestionSetSchema, with a validate +
 *      one-shot repair loop (see lib/rag/llm.ts).
 *   5. Persist each validated question, tagged with the source chunk ids
 *      it was grounded in, and return them to the caller.
 *
 * A document is never sent to the model in full — only the top-K
 * retrieved chunks — so generation cost stays roughly constant regardless
 * of source document length.
 */
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

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    return NextResponse.json({ error: `Document ${documentId} not found.` }, { status: 404 });
  }
  if (document.status !== "READY") {
    return NextResponse.json(
      {
        error: `Document is not ready for question generation (status: ${document.status}).`,
        hint: "Wait for chunking + embedding to finish before requesting an assessment.",
      },
      { status: 409 }
    );
  }

  const competencies = await prisma.competency.findMany({
    where: { fracCode: { in: competencyFracCodes } },
  });
  const foundCodes = new Set(competencies.map((c) => c.fracCode));
  const missingCodes = competencyFracCodes.filter((code) => !foundCodes.has(code));
  if (missingCodes.length > 0) {
    return NextResponse.json(
      { error: `Unknown FRAC competency code(s): ${missingCodes.join(", ")}` },
      { status: 422 }
    );
  }

  let chunks;
  try {
    chunks = await retrieveRelevantChunks({ documentId, competencyFracCodes });
  } catch (err) {
    return NextResponse.json(
      { error: "Retrieval failed.", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "No embedded chunks found for this document — has it finished processing?" },
      { status: 409 }
    );
  }

  let questionSet;
  try {
    questionSet = await generateQuestionsFromChunks({
      chunks,
      competencyFracCodes,
      questionCount,
      bloomDistribution,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Question generation failed schema validation after retries.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  const competencyByFracCode = new Map(competencies.map((c) => [c.fracCode, c]));

  const created = await prisma.$transaction(
    questionSet.questions.map((q) => {
      const competency = competencyByFracCode.get(q.competencyFracCode) ?? competencies[0];
      return prisma.question.create({
        data: {
          stem: q.stem,
          choices: q.choices,
          correctChoice: q.correctChoice,
          rationale: q.rationale,
          bloomLevel: q.bloomLevel,
          difficulty: q.difficulty,
          competencyId: competency.id,
          isAiGenerated: true,
          sourceDocumentId: documentId,
          sourceChunkIds: q.sourceChunkIds,
        },
      });
    })
  );

  return NextResponse.json(
    {
      documentId,
      generatedCount: created.length,
      questions: created,
    },
    { status: 201 }
  );
}
