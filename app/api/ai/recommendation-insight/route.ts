import { NextRequest, NextResponse } from "next/server";
import { generateCourseRecommendationInsight } from "@/lib/llm-service";
import { Officer, IgotCourse, CompetencyItem } from "@/lib/data-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { officer, course, competency } = body as {
      officer: Officer;
      course: IgotCourse;
      competency: CompetencyItem;
    };

    if (!officer || !course || !competency) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected officer, course, and competency." },
        { status: 400 }
      );
    }

    const insight = await generateCourseRecommendationInsight({
      officer,
      course,
      competency,
    });

    return NextResponse.json(insight, { status: 200 });
  } catch (err) {
    console.error("Error in /api/ai/recommendation-insight:", err);
    return NextResponse.json(
      { error: "Internal server error during recommendation insight generation." },
      { status: 500 }
    );
  }
}
