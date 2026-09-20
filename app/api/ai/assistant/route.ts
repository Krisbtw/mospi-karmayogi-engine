import { NextRequest, NextResponse } from "next/server";
import { getAllStoredChunks } from "@/lib/data-service";
import { getLLMConfig, DEFAULT_GROQ_API_KEY, DEFAULT_GROQ_MODEL } from "@/lib/llm-service";

export const runtime = "nodejs";

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

// Fallback Groq models in order of priority if primary hits rate limits
const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

async function callAssistantLLM(
  systemPrompt: string,
  userMessage: string,
  history: HistoryMessage[] = []
): Promise<string> {
  const config = getLLMConfig();

  // If provider is groq (or if Groq API key is available)
  if (config.provider === "groq" || process.env.GROQ_API_KEY || DEFAULT_GROQ_API_KEY) {
    const apiKey = config.apiKey || process.env.GROQ_API_KEY || DEFAULT_GROQ_API_KEY;
    const primaryModel = config.model || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    const modelsToTry = Array.from(new Set([primaryModel, ...GROQ_FALLBACK_MODELS]));

    const formattedHistory = history
      .slice(-4)
      .map((m) => ({ role: m.role, content: m.content }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: userMessage },
    ];

    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.35,
            max_tokens: 700,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const msg = data.choices?.[0]?.message;
          const text = msg?.content || msg?.reasoning;
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        } else {
          const errText = await res.text().catch(() => "");
          console.warn(`[Assistant] Groq model ${model} failed (${res.status}): ${errText.slice(0, 150)}`);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`[Assistant] Groq request error with ${model}:`, err?.message || err);
      }
    }
  }

  if (config.provider === "openai" || config.provider === "custom") {
    const url = `${config.baseURL || "https://api.openai.com/v1"}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    }
  }

  if (config.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": config.apiKey!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.content?.[0]?.text ?? "";
    }
  }

  if (config.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
  }

  throw new Error("Unable to obtain response from any configured LLM provider.");
}

function generateIntelligentFallback(
  question: string,
  officer: { name: string; designation: string; division: string },
  topGaps: string
): string {
  const q = question.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening)\b/i.test(q)) {
    const firstName = officer.name.split(" ")[0] || officer.name;
    return `Namaste, ${firstName}! 👋 How can I help you today? You can ask me about MoSPI statistical methodology (CPI, GDP, PLFS, ASI), your FRAC competency gaps, or recommended iGOT courses.`;
  }

  if (q.includes("jevons") || q.includes("elementary") || q.includes("cpi")) {
    return `The Jevons formula computes elementary aggregate price indices as the unweighted geometric mean of price relatives across sampled markets:\n\n$$P_{J} = \\prod_{i=1}^n \\left(\\frac{p_i^t}{p_i^0}\\right)^{1/n}$$\n\nIn MoSPI's CPI compilation, this is applied at the item-market level for rural and urban sectors before higher-level Laspeyres weighting.\n\n📖 Source: CPI Compilation Manual, Chapter 4.2`;
  }

  if (q.includes("gdp") || q.includes("national income") || q.includes("gva") || q.includes("sna")) {
    return `Under SNA 2008 guidelines adopted by MoSPI, GDP can be compiled through three equivalent approaches:\n\n1. **Production Approach**: Gross Value Added (GVA) at basic prices + Product taxes - Product subsidies.\n2. **Income Approach**: Compensation of Employees (CE) + Operating Surplus/Mixed Income (OS/MI) + Consumption of Fixed Capital (CFC) + Production taxes less subsidies.\n3. **Expenditure Approach**: Private Final Consumption (PFCE) + Government Final Consumption (GFCE) + Gross Capital Formation (GCF) + Net Exports (X - M).\n\n📖 Source: National Accounts Statistics (Sources & Methods, SNA 2008)`;
  }

  if (q.includes("plfs") || q.includes("sampling") || q.includes("stratif")) {
    return `The Periodic Labour Force Survey (PLFS) uses a stratified two-stage design:\n\n• **First Stage Units (FSUs)**: 2011 Census villages in rural areas and Urban Frame Survey (UFS) blocks in urban areas.\n• **Second Stage Units (SSUs)**: Households selected through circular systematic sampling.\n• **Rotational Panel**: Urban areas implement a 4-quarter rotational panel with 75% overlap to track quarterly changes.\n\n📖 Source: PLFS Operational Guidelines, Chapter 2`;
  }

  if (q.includes("gap") || q.includes("competenc") || q.includes("target")) {
    return `Here is your current FRAC competency diagnostic summary, ${officer.name}:\n\n• Active Priority Deficits: ${topGaps || "All targets met!"}\n• Key Focus: Review related NSSTA handbooks and complete the aligned 5-question diagnostic assessments in the Quiz Studio to raise your assessed proficiency level.`;
  }

  return `Here is guidance grounded in MoSPI official statistical manuals for "${question}":\n\nFor statistical methodology questions, please refer to the relevant NSSTA manuals:\n• **Price Indices**: CPI Compilation Manual (elementary aggregation, item basket)\n• **National Accounts**: Sources & Methods (SNA 2008, GVA by industry)\n• **Field Surveys**: PLFS Operational Guidelines & Sampling Instructions\n• **Industrial Statistics**: Annual Survey of Industries (ASI) Concepts & Definitions\n\nFeel free to ask a specific question on formulas, survey stratification, or your FRAC targets!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, officer, competencies, history } = body as {
      question: string;
      officer?: {
        name?: string;
        designation?: string;
        cadreRank?: string;
        division?: string;
        experienceLevel?: string;
        jobRole?: string;
      };
      competencies?: { label: string; fracCode: string; current: number; target: number; gap: number }[];
      history?: HistoryMessage[];
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Missing question." }, { status: 400 });
    }

    const safeOfficer = {
      name: officer?.name || "Statistical Officer",
      designation: officer?.designation || "Junior Statistical Officer",
      cadreRank: officer?.cadreRank || "JSO",
      division: officer?.division || "Field Operations Division (FOD)",
      experienceLevel: officer?.experienceLevel || "3+",
      jobRole: officer?.jobRole || "Field Survey & Data Collection",
    };

    const safeCompetencies = Array.isArray(competencies) ? competencies : [];

    // Instant, natural greeting if the user just says "hi", "hello", etc.
    const trimmedQ = question.trim();
    const isPureGreeting = /^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening)[\s!.]*$/i.test(trimmedQ);
    if (isPureGreeting) {
      const firstName = safeOfficer.name.split(" ")[0] || safeOfficer.name;
      return NextResponse.json({
        answer: `Namaste, ${firstName}! 👋 How can I help you today? You can ask me about MoSPI statistical methodology (CPI, GDP, PLFS, ASI), your FRAC competency gaps, or recommended iGOT courses.`,
        citations: [],
      }, { status: 200 });
    }

    // Keyword-based retrieval from stored manual chunks
    const allChunks = getAllStoredChunks();
    const qLower = question.toLowerCase();
    const relevant = allChunks
      .filter((chunk) => {
        const text = (chunk.content + " " + chunk.headingPath.join(" ")).toLowerCase();
        return qLower.split(/\s+/).some((word) => word.length > 3 && text.includes(word));
      })
      .slice(0, 3);

    const contextSnippets = relevant.length > 0
      ? relevant.map((c, i) => `[Manual Source ${i + 1}: ${c.headingPath.slice(-1)[0] || "NSSTA Manual"}]\n${c.content}`).join("\n\n")
      : "No specific manual passage matched. Use your expert knowledge of Indian official statistics methodology (MoSPI, NSSO, CSO).";

    const topGaps = safeCompetencies
      .filter((c) => c.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .map((c) => `${c.label} (gap: ${c.gap} levels)`)
      .join("; ");

    const systemPrompt = `You are an AI Statistical Learning Assistant for MoSPI (Ministry of Statistics & Programme Implementation), Government of India.
You are grounded in NSSTA-approved manuals: PLFS Operational Guidelines, CPI Compilation Manual, National Accounts Statistics (SNA 2008 Implementation), and ASI Methodology Manual.
Your role is to help government statistical officers learn concepts, understand their FRAC competency gaps, and navigate training programs.

Officer Profile:
- Name: ${safeOfficer.name}
- Designation: ${safeOfficer.designation} (${safeOfficer.cadreRank})
- Division: ${safeOfficer.division}
- Top Competency Gaps: ${topGaps || "No gaps — all targets met"}

Relevant Manual Passages:
${contextSnippets}

Response Guidelines:
- Keep your answers concise, direct, and conversational (1 to 2 short paragraphs max).
- Answer the user's specific question directly. Do NOT dump unsolicited background or course lists unless specifically asked.
- Cite official manual sources (e.g., CPI Compilation Manual, PLFS Operational Guidelines) when explaining methodology.
- Use encouraging, professional language suited for an Indian civil service officer.`;

    let answer = "";
    try {
      answer = await callAssistantLLM(systemPrompt, question, history || []);
    } catch (llmErr) {
      console.warn("Live LLM call failed in assistant route, using domain-grounded response:", llmErr);
      answer = generateIntelligentFallback(question, safeOfficer, topGaps);
    }

    const citations = relevant.slice(0, 2).map((c) => ({
      source: c.headingPath.slice(-1)[0] || "NSSTA Manual",
      snippet: c.content.slice(0, 130) + "…",
    }));

    return NextResponse.json({ answer, citations }, { status: 200 });
  } catch (err) {
    console.error("Critical error in /api/ai/assistant:", err);
    return NextResponse.json({
      answer: "Namaste! I am your MoSPI Statistical Learning Assistant. How can I assist you with your statistical training, NSSTA manuals, or FRAC competencies today?",
      citations: [],
    }, { status: 200 });
  }
}
