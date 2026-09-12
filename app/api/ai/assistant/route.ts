import { NextRequest, NextResponse } from "next/server";
import { getAllStoredChunks } from "@/lib/data-service";
import { getLLMConfig } from "@/lib/llm-service";

export const runtime = "nodejs";

// Internal helper — mirrors the pattern used in other AI routes
async function callAssistantLLM(systemPrompt: string, userMessage: string): Promise<string> {
  const config = getLLMConfig();

  if (config.provider === "fallback") {
    throw new Error("No LLM API key configured.");
  }

  if (config.provider === "openai" || config.provider === "groq" || config.provider === "custom") {
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
    if (!res.ok) throw new Error(`LLM error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
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
    if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
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
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  throw new Error("Unsupported LLM provider.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, officer, competencies } = body as {
      question: string;
      officer: {
        name: string;
        designation: string;
        cadreRank: string;
        division: string;
        experienceLevel: string;
        jobRole: string;
      };
      competencies: { label: string; fracCode: string; current: number; target: number; gap: number }[];
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Missing question." }, { status: 400 });
    }

    // Simple keyword-based retrieval from stored manual chunks
    const allChunks = getAllStoredChunks();
    const qLower = question.toLowerCase();
    const relevant = allChunks
      .filter((chunk) => {
        const text = (chunk.content + " " + chunk.headingPath.join(" ")).toLowerCase();
        return qLower.split(/\s+/).some((word) => word.length > 4 && text.includes(word));
      })
      .slice(0, 3);

    const contextSnippets = relevant.length > 0
      ? relevant.map((c, i) => `[Manual Source ${i + 1}: ${c.headingPath.slice(-1)[0]}]\n${c.content}`).join("\n\n")
      : "No specific manual passage matched. Use your knowledge of Indian official statistics methodology.";

    const topGaps = competencies
      .filter((c) => c.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .map((c) => `${c.label} (gap: ${c.gap} levels)`)
      .join("; ");

    const systemPrompt = `You are an AI Statistical Learning Assistant for MoSPI (Ministry of Statistics & Programme Implementation), India.
You are grounded in NSSTA-approved manuals: PLFS Operational Guidelines, CPI Compilation Manual, National Accounts Statistics (SNA 2008 Implementation), and ASI Methodology Manual.
Your role is to help government statistical officers learn concepts, understand their FRAC competency gaps, and navigate training programs.

Officer Profile:
- Name: ${officer.name}
- Designation: ${officer.designation} (Cadre: ${officer.cadreRank})
- Division: ${officer.division}
- Experience: ${officer.experienceLevel} years
- Job Role: ${officer.jobRole}
- Top Competency Gaps: ${topGaps || "No gaps — all targets met"}

Relevant Manual Passages:
${contextSnippets}

Response Guidelines:
- Be helpful, clear and concise (max 4 paragraphs)
- Cite the manual source when referencing specific methodology
- If the question relates to the officer's gaps, provide targeted advice
- If recommending a course, mention iGOT or NSSTA TPAC specifically
- Use formal but friendly language appropriate for a government officer`;

    const answer = await callAssistantLLM(systemPrompt, question);

    const citations = relevant.slice(0, 2).map((c) => ({
      source: c.headingPath.slice(-1)[0] || "NSSTA Manual",
      snippet: c.content.slice(0, 130) + "…",
    }));

    return NextResponse.json({ answer, citations }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/ai/assistant:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
