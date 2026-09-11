import { NextRequest, NextResponse } from "next/server";
import { analyzeCompetencyGaps } from "@/lib/llm-service";
import { Officer, CompetencyItem } from "@/lib/data-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { officer, competencies } = body as {
      officer: Officer;
      competencies: CompetencyItem[];
    };

    if (!officer || !competencies || !Array.isArray(competencies)) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected officer and competencies array." },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompetencyGaps({ officer, competencies });
    return NextResponse.json(analysis, { status: 200 });
  } catch (err) {
    console.error("Error in /api/ai/competency-analysis:", err);
    return NextResponse.json(
      { error: "Internal server error during competency analysis." },
      { status: 500 }
    );
  }
}
