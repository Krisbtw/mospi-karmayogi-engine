import { retrieveRelevantChunks, RetrievedChunk } from "./rag/retrieval";
import {
  Officer,
  CompetencyItem,
  IgotCourse,
  AssessmentQuestion,
  QuestionChoice,
  getStoredDocument,
  PRELOADED_DOCUMENTS,
  resolveQuestionsForQuiz,
  randomizeQuizQuestions,
  getCompetencyForDocument,
} from "./data-service";

export interface LLMConfig {
  provider: "openai" | "anthropic" | "gemini" | "groq" | "custom" | "fallback";
  model: string;
  apiKey?: string;
  baseURL?: string;
}

/**
 * Detects the configured LLM provider from server environment variables.
 * Keep secrets completely on backend.
 */
export function getLLMConfig(): LLMConfig {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "") {
    return {
      provider: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY.trim(),
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    };
  }

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== "") {
    return {
      provider: "anthropic",
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    };
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
    if (key) {
      return {
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        apiKey: key,
      };
    }
  }

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== "") {
    return {
      provider: "groq",
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      apiKey: process.env.GROQ_API_KEY.trim(),
      baseURL: "https://api.groq.com/openai/v1",
    };
  }

  if (process.env.LLM_BASE_URL && process.env.LLM_BASE_URL.trim() !== "") {
    return {
      provider: "custom",
      model: process.env.LLM_MODEL || "default",
      apiKey: process.env.LLM_API_KEY || "dummy",
      baseURL: process.env.LLM_BASE_URL.trim(),
    };
  }

  return {
    provider: "fallback",
    model: "statistical-grounded-engine",
  };
}

/**
 * Low-level chat completion caller that supports OpenAI-compatible endpoints,
 * Anthropic Claude, and Google Gemini with JSON enforcement.
 */
async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  expectJson: boolean = true
): Promise<string> {
  const config = getLLMConfig();

  if (config.provider === "fallback") {
    throw new Error("No live LLM API key configured in environment.");
  }

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

    try {
      if (config.provider === "openai" || config.provider === "groq" || config.provider === "custom") {
        const url = `${config.baseURL || "https://api.openai.com/v1"}/chat/completions`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
            ...(expectJson ? { response_format: { type: "json_object" } } : {}),
          }),
          signal: controller.signal,
        });

        if (res.status === 429 && attempt < maxRetries) {
          clearTimeout(timeoutId);
          console.warn(`[LLM Service] 429 Rate Limit encountered on attempt ${attempt + 1}. Retrying in 2s...`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`LLM call failed (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      }

      if (config.provider === "anthropic") {
        const url = "https://api.anthropic.com/v1/messages";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey || "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        if (res.status === 429 && attempt < maxRetries) {
          clearTimeout(timeoutId);
          console.warn(`[LLM Service] 429 Rate Limit encountered on attempt ${attempt + 1}. Retrying in 2s...`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Anthropic LLM call failed (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        return data.content?.[0]?.text || "";
      }

      if (config.provider === "gemini") {
        const modelName = config.model;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              ...(expectJson ? { responseMimeType: "application/json" } : {}),
            },
          }),
          signal: controller.signal,
        });

        if (res.status === 429 && attempt < maxRetries) {
          clearTimeout(timeoutId);
          console.warn(`[LLM Service] 429 Rate Limit encountered on attempt ${attempt + 1}. Retrying in 2s...`);
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Gemini LLM call failed (${res.status}): ${errorText}`);
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      throw new Error(`Unsupported provider: ${config.provider}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("LLM call failed after retries.");
}

function cleanJsonText(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

// In-memory caches to prevent duplicate LLM calls and avoid free-tier rate limits
const competencyAnalysisCache = new Map<string, CompetencyAnalysisResult>();
const recommendationCache = new Map<string, RecommendationInsightResult>();
const answerExplanationCache = new Map<string, AnswerExplanationResult>();

function getFallbackProviderLabel(config: LLMConfig, baseName: string): string {
  if (config.provider !== "fallback") {
    return `${config.provider.toUpperCase()} (${config.model})`;
  }
  return baseName;
}

/* ==========================================================================
   FEATURE 1: AI Competency Analysis
   ========================================================================== */

export interface CompetencyAnalysisResult {
  officerName: string;
  cadreRank: string;
  weakCompetencies: {
    fracCode: string;
    label: string;
    current: number;
    target: number;
    gap: number;
    priority: "Critical" | "High" | "Medium" | "Complete";
  }[];
  primaryGap: {
    fracCode: string;
    label: string;
    reason: string;
  };
  executiveInsight: string;
  recommendedFocus: string[];
  isLiveLLM: boolean;
  provider: string;
}

export async function analyzeCompetencyGaps(params: {
  officer: Officer;
  competencies: CompetencyItem[];
}): Promise<CompetencyAnalysisResult> {
  const { officer, competencies } = params;
  const config = getLLMConfig();

  const cacheKey = `${officer.id || officer.name}_${competencies.map((c) => `${c.fracCode}:${c.current}`).join(",")}`;
  const cached = competencyAnalysisCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Calculate actual scores from application data (no hallucinated scores)
  const gaps = competencies
    .map((c) => {
      const gap = Math.max(0, c.target - c.current);
      const ratio = gap / (c.target || 1);
      const priority =
        gap === 0
          ? ("Complete" as const)
          : ratio >= 0.5
          ? ("Critical" as const)
          : ratio >= 0.3
          ? ("High" as const)
          : ("Medium" as const);
      return {
        fracCode: c.fracCode,
        label: c.label,
        current: c.current,
        target: c.target,
        gap,
        priority,
      };
    })
    .sort((a, b) => b.gap - a.gap);

  const activeGaps = gaps.filter((g) => g.gap > 0);
  const primaryGap = activeGaps[0] || {
    fracCode: competencies[0]?.fracCode || "FN-STAT-014",
    label: competencies[0]?.label || "Statistical Methodology",
    gap: 0,
    current: 4,
    target: 4,
    priority: "Complete",
  };

  const systemPrompt = [
    "You are an AI Competency Analyst for the Ministry of Statistics & Programme Implementation (MoSPI), Government of India.",
    "Your duty is to produce a concise, professional diagnostic assessment of an officer's FRAC (Framework for Roles, Activities and Competencies) profile.",
    "STRICT RULES:",
    "1. Never invent or alter scores. Use ONLY the provided numbers and targets.",
    "2. Identify which competency the officer is weak in.",
    "3. Explain WHY it is a gap based on their cadre requirements.",
    "4. State WHAT the officer should focus on next.",
    "5. Return strictly valid JSON.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    officer: {
      name: officer.name,
      cadreRank: officer.cadreRank,
      designation: officer.designation,
      division: officer.division,
      region: officer.region,
    },
    competencyData: gaps,
    task: "Generate executive insight, explain primary gap, and list actionable focus areas.",
    expectedFormat: {
      primaryGapReason: "Why this specific gap matters for this cadre rank and division",
      executiveInsight: "2-3 sentence executive summary explaining weaknesses and compliance readiness",
      recommendedFocus: ["Action item 1", "Action item 2", "Action item 3"],
    },
  });

  if (config.provider !== "fallback") {
    try {
      const raw = await callLLM(systemPrompt, userPrompt, true);
      const parsed = JSON.parse(cleanJsonText(raw));
      const result: CompetencyAnalysisResult = {
        officerName: officer.name,
        cadreRank: officer.cadreRank,
        weakCompetencies: gaps,
        primaryGap: {
          fracCode: primaryGap.fracCode,
          label: primaryGap.label,
          reason: parsed.primaryGapReason || `Current proficiency (${primaryGap.current}/5) does not meet ${officer.cadreRank} target (${primaryGap.target}/5).`,
        },
        executiveInsight: parsed.executiveInsight || `${officer.name} (${officer.cadreRank}) has ${activeGaps.length} active competency gaps requiring targeted intervention.`,
        recommendedFocus: parsed.recommendedFocus || [
          `Prioritize diagnostic quizzes on ${primaryGap.label} (${primaryGap.fracCode})`,
          `Enroll in aligned iGOT Karmayogi modules to bridge the ${primaryGap.gap}-level deficit`,
          `Review official MoSPI guidelines for field compliance`,
        ],
        isLiveLLM: true,
        provider: `${config.provider.toUpperCase()} (${config.model})`,
      };
      competencyAnalysisCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn("Live LLM competency analysis failed, falling back gracefully:", err);
    }
  }

  // Domain-Grounded Fallback (No hallucinated scores; deterministic reasoning)
  const totalGapLevels = activeGaps.reduce((sum, g) => sum + g.gap, 0);
  const metCount = gaps.filter((g) => g.gap === 0).length;
  const complianceRate = Math.round((metCount / (gaps.length || 1)) * 100);

  return {
    officerName: officer.name,
    cadreRank: officer.cadreRank,
    weakCompetencies: gaps,
    primaryGap: {
      fracCode: primaryGap.fracCode,
      label: primaryGap.label,
      reason: `Assessed at Level ${primaryGap.current}/5 against the ${officer.cadreRank} Cadre Benchmark of ${primaryGap.target}/5. In the ${officer.division} division, this creates a ${primaryGap.gap}-level deficiency in production standards.`,
    },
    executiveInsight: `${officer.name} (${officer.cadreRank}) currently meets ${metCount} of ${gaps.length} core competencies (${complianceRate}% FRAC compliance), with ${totalGapLevels} total proficiency levels to close. Urgent priority must be directed toward ${primaryGap.label} (${primaryGap.fracCode}) before advancing to medium-priority skills.`,
    recommendedFocus: [
      `Immediate completion of diagnostic re-tests for ${primaryGap.label}`,
      `Enrollment in the aligned iGOT course for ${primaryGap.fracCode} to advance from Level ${primaryGap.current} to ${primaryGap.target}`,
      `MoSPI Handbook grounding on sampling frames and index aggregation`,
    ],
    isLiveLLM: false,
    provider: getFallbackProviderLabel(config, "MoSPI Grounded Analytical Engine"),
  };
}

/* ==========================================================================
   FEATURE 2: Personalized Learning Recommendations
   ========================================================================== */

export interface RecommendationInsightResult {
  courseId: string;
  courseTitle: string;
  competencyFracCode: string;
  personalizedRationale: string;
  keySkillsAddressed: string[];
  estimatedImpact: string;
  isLiveLLM: boolean;
  provider: string;
}

export async function generateCourseRecommendationInsight(params: {
  officer: Officer;
  course: IgotCourse;
  competency: CompetencyItem;
}): Promise<RecommendationInsightResult> {
  const { officer, course, competency } = params;
  const config = getLLMConfig();

  const cacheKey = `${officer.id || officer.name}_${course.id}_${competency.fracCode}_${competency.current}`;
  const cached = recommendationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const gap = Math.max(0, competency.target - competency.current);

  const systemPrompt = [
    "You are an AI Learning Advisor for India's iGOT Karmayogi civil service platform.",
    "Your job is to provide a strictly personalized explanation for why a specific existing course is recommended for an officer.",
    "STRICT RULES:",
    "1. Use ONLY the existing course title and details. Do NOT hallucinate new courses, links, or providers.",
    "2. Explain how this course directly closes the officer's specific FRAC gap.",
    "3. Keep it professional, encouraging, and under 3 sentences.",
    "4. Return strictly valid JSON.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    officer: {
      name: officer.name,
      cadreRank: officer.cadreRank,
      designation: officer.designation,
      division: officer.division,
    },
    competencyGap: {
      fracCode: competency.fracCode,
      label: competency.label,
      currentLevel: competency.current,
      targetLevel: competency.target,
      gapLevels: gap,
    },
    course: {
      id: course.id,
      title: course.courseTitle,
      provider: course.provider,
      durationHours: course.durationHours,
      matchScore: Math.round(course.matchScore * 100),
    },
    expectedFormat: {
      personalizedRationale: "Personalized explanation connecting the officer's gap to this course",
      keySkillsAddressed: ["Skill 1", "Skill 2"],
      estimatedImpact: "e.g. Elevates proficiency from Level 2 to Level 3",
    },
  });

  if (config.provider !== "fallback") {
    try {
      const raw = await callLLM(systemPrompt, userPrompt, true);
      const parsed = JSON.parse(cleanJsonText(raw));
      const result: RecommendationInsightResult = {
        courseId: course.id,
        courseTitle: course.courseTitle,
        competencyFracCode: competency.fracCode,
        personalizedRationale: parsed.personalizedRationale || `Recommended for ${officer.name} to bridge the ${gap}-level gap in ${competency.label}.`,
        keySkillsAddressed: parsed.keySkillsAddressed || [competency.label, "Methodological Compliance"],
        estimatedImpact: parsed.estimatedImpact || `Increments proficiency from Level ${competency.current} to ${competency.target} upon completion.`,
        isLiveLLM: true,
        provider: `${config.provider.toUpperCase()} (${config.model})`,
      };
      recommendationCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn("Live LLM recommendation insight failed, falling back gracefully:", err);
    }
  }

  // Domain-Grounded Fallback
  return {
    courseId: course.id,
    courseTitle: course.courseTitle,
    competencyFracCode: competency.fracCode,
    personalizedRationale: `Tailored for ${officer.name} (${officer.cadreRank} in ${officer.division}) to address the active ${gap}-level deficit in ${competency.label}. Delivered by ${course.provider}, this ${course.durationHours}-hour curriculum provides operational mastery directly tied to your cadre target.`,
    keySkillsAddressed: [
      competency.label,
      `${course.provider} standard operating procedures`,
      "Practical error-check tabulation",
    ],
    estimatedImpact: `Closes the ${gap}-level gap, advancing proficiency from Level ${competency.current} to ${competency.target} on your FRAC profile.`,
    isLiveLLM: false,
    provider: getFallbackProviderLabel(config, "iGOT Karmayogi Recommendation Engine"),
  };
}

/* ==========================================================================
   FEATURE 3 & 4: AI MCQ Generation & Source-Grounded Generation
   ========================================================================== */

export async function generateSourceGroundedMCQs(params: {
  documentId: string;
  competencyFracCode: string;
  questionCount: number;
  difficulty?: number;
  bloomLevel?: string;
}): Promise<AssessmentQuestion[]> {
  const { documentId, competencyFracCode, questionCount, difficulty = 3, bloomLevel = "APPLY" } = params;
  const config = getLLMConfig();

  const memDoc =
    getStoredDocument(documentId) ||
    PRELOADED_DOCUMENTS.find((d) => d.id === documentId);
  const docTitle = memDoc ? memDoc.title : "MoSPI Statistical Operational Guidelines";

  // Re-align competency if document is mapped to a specific domain (e.g. National Accounts)
  const mappedDocFrac = memDoc ? getCompetencyForDocument(memDoc) : "";
  const effectiveFrac =
    (mappedDocFrac && mappedDocFrac !== "FN-STAT-014")
      ? mappedDocFrac
      : (competencyFracCode || mappedDocFrac || "FN-STAT-014");

  const compLabel =
    effectiveFrac === "FN-STAT-021"
      ? "National Income Accounting"
      : effectiveFrac === "DM-PRICE-002"
      ? "Price Statistics (CPI/WPI)"
      : effectiveFrac === "FN-STAT-042"
      ? "Industrial Production Indexing"
      : effectiveFrac === "FN-STAT-033"
      ? "R/Python for Survey Processing"
      : effectiveFrac === "BH-INTEGRITY-001"
      ? "Data Integrity & Ethics"
      : "Survey Sampling Design";

  // 1. Retrieve Grounding Chunks via existing RAG pipeline
  let chunks: RetrievedChunk[] = [];
  try {
    chunks = await retrieveRelevantChunks({
      documentId,
      competencyFracCodes: [effectiveFrac],
    });
  } catch (err) {
    console.warn("RAG retrieval encountered an error:", err);
  }

  if (config.provider !== "fallback" && chunks.length > 0) {
    try {
      const excerptBlock = chunks
        .slice(0, 6)
        .map((c, idx) => `[Excerpt ${idx + 1}] (${c.headingPath.join(" > ") || "Section"})\n${c.content}`)
        .join("\n\n---\n\n");

      const systemPrompt = [
        "You are an assessment expert for India's Official Statistical System (MoSPI: NSSO, CSO, Price Statistics, National Accounts, ASI).",
        "STRICT SOURCE-GROUNDING RULES:",
        `1. Prioritize and strictly base every question on the provided SOURCE EXCERPTS from '${docTitle}'.`,
        "2. Do NOT cross-contaminate topics. For example, if the document/excerpts are about National Accounts (GDP, GVA, SDP, DDP, CFC), do NOT generate questions about PLFS or UFS sampling blocks.",
        "3. Generate exactly the requested number of multiple-choice questions.",
        "4. Exactly 4 options per question (A, B, C, D), exactly one correct. IMPORTANT: Randomly vary the correct choice letter across A, B, C, and D (never make all questions answer A).",
        "5. Include a clear explanation citing the excerpt.",
        "6. Return ONLY a JSON object with a 'questions' array.",
      ].join("\n");

      const userPrompt = JSON.stringify({
        competencyFracCode: effectiveFrac,
        competencyLabel: compLabel,
        questionCount,
        targetDifficulty: difficulty,
        targetBloomLevel: bloomLevel,
        documentTitle: docTitle,
        sourceExcerpts: excerptBlock,
        format: {
          questions: [
            {
              stem: "Question text strictly grounded in excerpt",
              choices: [
                { id: "A", text: "Option A text" },
                { id: "B", text: "Option B text" },
                { id: "C", text: "Option C text" },
                { id: "D", text: "Option D text" },
              ],
              correctChoice: "B",
              rationale: "Explanation of why correctChoice is right and others are wrong",
              difficulty: difficulty,
              bloomLevel: bloomLevel,
              sourceCitation: "Chapter / Section from excerpt",
              sourceSnippet: "Exact sentence or excerpt fragment supporting the answer",
            },
          ],
        },
      });

      const raw = await callLLM(systemPrompt, userPrompt, true);
      const parsed = JSON.parse(cleanJsonText(raw));

      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const liveQuestions: AssessmentQuestion[] = parsed.questions.map((q: any, i: number) => {
          const matchingChunk = chunks[i % chunks.length];
          return {
            id: `q_ai_live_${Date.now()}_${i}`,
            stem: q.stem,
            choices: q.choices as QuestionChoice[],
            correctChoice: q.correctChoice as "A" | "B" | "C" | "D",
            rationale: q.rationale,
            bloomLevel: (q.bloomLevel || bloomLevel) as any,
            difficulty: Number(q.difficulty) || difficulty,
            competencyFracCode: effectiveFrac,
            competencyLabel: compLabel,
            sourceDocument: docTitle,
            sourceCitation: q.sourceCitation || matchingChunk?.headingPath.join(" > ") || "MoSPI Reference Section",
            sourceSnippet: q.sourceSnippet || matchingChunk?.content.slice(0, 240) || q.rationale,
          };
        });
        return randomizeQuizQuestions(liveQuestions);
      }
    } catch (err) {
      console.warn("Live LLM question generation failed, falling back gracefully:", err);
    }
  }

  // Grounded Multi-tier Fallback (Guarantees exact count, difficulty scaling, and source grounding)
  const resolved = resolveQuestionsForQuiz({
    documentId,
    competencyFracCode: effectiveFrac,
    questionCount,
    difficulty,
    bloomLevel,
  });

  return randomizeQuizQuestions(resolved.map((q) => ({
    ...q,
    sourceDocument: docTitle,
  })));
}

/* ==========================================================================
   FEATURE 5: AI Answer Explanation
   ========================================================================== */

export interface AnswerExplanationResult {
  questionId: string;
  chosenChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
  simpleExplanation: string;
  misconceptionAnalysis?: string;
  sourceGroundedEvidence: string;
  keyTakeaway: string;
  isLiveLLM: boolean;
  provider: string;
}

export async function explainAnswer(params: {
  question: AssessmentQuestion;
  chosenChoiceId: string;
  officerName?: string;
}): Promise<AnswerExplanationResult> {
  const { question, chosenChoiceId, officerName = "Officer" } = params;
  const config = getLLMConfig();
  const isCorrect = chosenChoiceId === question.correctChoice;

  const cacheKey = `${question.id}_${chosenChoiceId}`;
  const cached = answerExplanationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const chosenChoiceText =
    question.choices.find((c) => c.id === chosenChoiceId)?.text || chosenChoiceId;
  const correctChoiceText =
    question.choices.find((c) => c.id === question.correctChoice)?.text || question.correctChoice;

  const systemPrompt = [
    "You are an AI Statistical Mentor for India's civil servants in the Ministry of Statistics & Programme Implementation.",
    "Explain why the answer to a multiple choice diagnostic question is correct or incorrect in simple, clear language.",
    "STRICT RULES:",
    "1. Ground your explanation in the provided source handbook snippet and official MoSPI methodology.",
    "2. If incorrect, explain why the chosen choice is a misconception without being condescending.",
    "3. Highlight a practical key takeaway for statistical field/desk duty.",
    "4. Return strictly valid JSON.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    officerName,
    competency: question.competencyFracCode,
    question: question.stem,
    choices: question.choices,
    correctChoice: { id: question.correctChoice, text: correctChoiceText },
    officerChoice: { id: chosenChoiceId, text: chosenChoiceText, isCorrect },
    sourceContext: {
      document: question.sourceDocument,
      citation: question.sourceCitation,
      snippet: question.sourceSnippet,
      handbookRationale: question.rationale,
    },
    expectedFormat: {
      simpleExplanation: "Clear explanation in simple language why the correct answer is right",
      misconceptionAnalysis: isCorrect ? undefined : "Why the officer's selected choice is incorrect",
      sourceGroundedEvidence: "How this is grounded in the MoSPI manual excerpt",
      keyTakeaway: "One actionable takeaway for statistical operations",
    },
  });

  if (config.provider !== "fallback") {
    try {
      const raw = await callLLM(systemPrompt, userPrompt, true);
      const parsed = JSON.parse(cleanJsonText(raw));
      const result: AnswerExplanationResult = {
        questionId: question.id,
        chosenChoiceId,
        correctChoiceId: question.correctChoice,
        isCorrect,
        simpleExplanation: parsed.simpleExplanation || question.rationale,
        misconceptionAnalysis: isCorrect
          ? undefined
          : parsed.misconceptionAnalysis || `Option ${chosenChoiceId} deviates from the official MoSPI protocol.`,
        sourceGroundedEvidence: parsed.sourceGroundedEvidence || question.sourceSnippet,
        keyTakeaway: parsed.keyTakeaway || `Always refer to ${question.sourceDocument} (${question.sourceCitation}) when validating frame calculations.`,
        isLiveLLM: true,
        provider: `${config.provider.toUpperCase()} (${config.model})`,
      };
      answerExplanationCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn("Live LLM answer explanation failed, falling back gracefully:", err);
    }
  }

  // Domain-Grounded Fallback
  return {
    questionId: question.id,
    chosenChoiceId,
    correctChoiceId: question.correctChoice,
    isCorrect,
    simpleExplanation: isCorrect
      ? `Correct! As specified in official MoSPI methodology: Option ${question.correctChoice} ("${correctChoiceText}") accurately reflects the required statistical protocol.`
      : `Option ${chosenChoiceId} ("${chosenChoiceText}") is incorrect. The correct answer is Option ${question.correctChoice} ("${correctChoiceText}"). ${question.rationale}`,
    misconceptionAnalysis: isCorrect
      ? undefined
      : `Selecting Option ${chosenChoiceId} often occurs when confounding survey rotation schemes with baseline census enumeration. In MoSPI operations, rotation protocols must preserve panel continuity.`,
    sourceGroundedEvidence: `Grounded in ${question.sourceDocument} [${question.sourceCitation}]: "${question.sourceSnippet.slice(0, 180)}..."`,
    keyTakeaway: `Benchmark takeaway: Ensure calculations strictly align with ${question.sourceCitation} to prevent non-sampling biases.`,
    isLiveLLM: false,
    provider: getFallbackProviderLabel(config, "MoSPI Grounded Explainer Engine"),
  };
}
