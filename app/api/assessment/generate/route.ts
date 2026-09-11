import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GenerateAssessmentRequestSchema } from "@/lib/rag/schema";
import { generateSourceGroundedMCQs } from "@/lib/llm-service";
import {
  getStoredDocument,
  PRELOADED_DOCUMENTS,
  AssessmentQuestion,
  getCompetencyForDocument,
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
  const { documentId, competencyFracCodes, questionCount, difficulty, bloomLevel } = parsed.data;

  // 1. Verify Document Title
  let docTitle = "MoSPI Methodology Handbook";
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

  // 2. Generate MCQs using Unified LLM + RAG Service
  const mappedDocFrac = memDoc ? getCompetencyForDocument(memDoc) : "";
  const primaryFrac =
    (mappedDocFrac && mappedDocFrac !== "FN-STAT-014")
      ? mappedDocFrac
      : (competencyFracCodes[0] || mappedDocFrac || "FN-STAT-014");

  let generatedList: AssessmentQuestion[] = [];

  try {
    generatedList = await generateSourceGroundedMCQs({
      documentId,
      competencyFracCode: primaryFrac,
      questionCount,
      difficulty,
      bloomLevel,
    });
  } catch (err) {
    console.error("Error in generateSourceGroundedMCQs:", err);
  }

  // 3. Optional Prisma persistence
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
            sourceChunkIds: ["chunk_rag"],
          },
        });
      }
    }
  } catch {
    // Prisma offline, continue
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
