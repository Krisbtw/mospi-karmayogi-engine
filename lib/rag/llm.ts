import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  GeneratedQuestionSetSchema,
  type GeneratedQuestionSet,
} from "./schema";
import type { RetrievedChunk } from "./retrieval";

const MAX_REPAIR_ATTEMPTS = 2;

function buildSystemPrompt(): string {
  return [
    "You are an assessment-design expert for India's Official Statistical",
    "System (MoSPI: NSSO, CSO, National Accounts, Index Numbers, ASI, PLFS).",
    "You write multiple-choice questions strictly grounded in the provided",
    "source excerpts — never invent a statistic, formula, survey round, or",
    "definition that is not present in the excerpts.",
    "",
    "Rules:",
    "- Every question must be answerable using only the given excerpts.",
    "- Exactly 4 choices per question, exactly one correct.",
    "- Distractors must be plausible (common misconceptions, adjacent",
    "  concepts, off-by-one methodology errors) — never absurd filler.",
    "- Tag each question with the Bloom's Taxonomy level it actually tests.",
    "- Cite which chunk id(s) grounded the question in sourceChunkIds.",
    "- Return ONLY JSON matching the provided schema. No prose, no markdown fences.",
  ].join("\n");
}

function buildUserPrompt(params: {
  chunks: RetrievedChunk[];
  competencyFracCodes: string[];
  questionCount: number;
  bloomDistribution?: Partial<Record<string, number>>;
}): string {
  const excerptBlock = params.chunks
    .map((c) => `[chunk:${c.id}] (${c.headingPath.join(" > ") || "untitled section"})\n${c.content}`)
    .join("\n\n---\n\n");

  const bloomHint = params.bloomDistribution
    ? `Target Bloom distribution (counts): ${JSON.stringify(params.bloomDistribution)}`
    : "Spread questions across at least 3 different Bloom levels.";

  return [
    `Generate exactly ${params.questionCount} MCQs.`,
    `Target FRAC competency codes: ${params.competencyFracCodes.join(", ")}.`,
    bloomHint,
    "",
    "SOURCE EXCERPTS:",
    excerptBlock,
  ].join("\n");
}

/**
 * Calls the LLM with the retrieved, grounding chunks and validates the
 * response against GeneratedQuestionSetSchema. On a schema-validation
 * failure, it re-prompts once with the Zod error appended so the model can
 * self-correct, rather than silently returning malformed questions.
 */
export async function generateQuestionsFromChunks(params: {
  chunks: RetrievedChunk[];
  competencyFracCodes: string[];
  questionCount: number;
  bloomDistribution?: Partial<Record<string, number>>;
}): Promise<GeneratedQuestionSet> {
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    temperature: 0.3,
    maxTokens: 4096,
  });

  const jsonSchema = zodToJsonSchema(GeneratedQuestionSetSchema, "GeneratedQuestionSet");
  const systemPrompt = buildSystemPrompt();
  let userPrompt = buildUserPrompt(params);

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    const messages = [
      new SystemMessage(
        `${systemPrompt}\n\nJSON schema you must conform to:\n${JSON.stringify(jsonSchema)}`
      ),
      new HumanMessage(
        lastError
          ? `${userPrompt}\n\nYour previous output failed validation with:\n${lastError}\nReturn corrected JSON only.`
          : userPrompt
      ),
    ];

    const response = await model.invoke(messages);
    const rawText =
      typeof response.content === "string"
        ? response.content
        : response.content.map((b: any) => ("text" in b ? b.text : "")).join("");

    const parsed = safeJsonParse(rawText);
    if (!parsed.ok) {
      lastError = parsed.error;
      continue;
    }

    const validated = GeneratedQuestionSetSchema.safeParse(parsed.value);
    if (validated.success) {
      return validated.data;
    }

    lastError = validated.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
  }

  throw new Error(
    `LLM failed to produce a schema-valid question set after ${MAX_REPAIR_ATTEMPTS + 1} attempts. Last error: ${lastError}`
  );
}

function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  // Models occasionally wrap JSON in a fenced block despite instructions;
  // strip fences defensively before parsing rather than failing outright.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return { ok: true, value: JSON.parse(cleaned) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown JSON parse error" };
  }
}
