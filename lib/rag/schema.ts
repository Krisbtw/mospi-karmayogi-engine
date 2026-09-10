import { z } from "zod";

export const BloomLevelSchema = z.enum([
  "REMEMBER",
  "UNDERSTAND",
  "APPLY",
  "ANALYZE",
  "EVALUATE",
  "CREATE",
]);

export const ChoiceSchema = z.object({
  id: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1).max(400),
});

/// One MCQ as the LLM must emit it. `sourceChunkIds` lets the caller trace
/// every generated question back to the exact retrieved passages that
/// grounded it, which both prevents hallucinated statistics and gives
/// reviewers a one-click "show me the source paragraph" audit trail.
export const GeneratedQuestionSchema = z
  .object({
    stem: z.string().min(10).max(600),
    choices: z.array(ChoiceSchema).length(4),
    correctChoice: z.enum(["A", "B", "C", "D"]),
    rationale: z.string().min(10).max(800),
    bloomLevel: BloomLevelSchema,
    difficulty: z.number().int().min(1).max(5),
    competencyFracCode: z.string().min(1),
    sourceChunkIds: z.array(z.string()).min(1),
  })
  .refine((q) => q.choices.some((c) => c.id === q.correctChoice), {
    message: "correctChoice must match one of the four choice ids",
  });

export const GeneratedQuestionSetSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1).max(20),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedQuestionSet = z.infer<typeof GeneratedQuestionSetSchema>;

export const GenerateAssessmentRequestSchema = z.object({
  documentId: z.string().min(1),
  competencyFracCodes: z.array(z.string()).min(1),
  questionCount: z.number().int().min(1).max(20).default(10),
  difficulty: z.number().int().min(1).max(5).optional(),
  bloomLevel: z.string().optional(),
  bloomDistribution: z.record(BloomLevelSchema, z.number().int().min(0)).optional(),
  cadreRank: z
    .enum(["JSO", "SO", "ASO", "DD", "DIRECTOR", "SENIOR_DIRECTOR"])
    .optional(),
});

export type GenerateAssessmentRequest = z.infer<typeof GenerateAssessmentRequestSchema>;
