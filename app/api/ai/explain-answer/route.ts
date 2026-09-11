import { NextRequest, NextResponse } from "next/server";
import { explainAnswer } from "@/lib/llm-service";
import { AssessmentQuestion } from "@/lib/data-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, chosenChoiceId, officerName } = body as {
      question: AssessmentQuestion;
      chosenChoiceId: string;
      officerName?: string;
    };

    if (!question || !chosenChoiceId) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected question and chosenChoiceId." },
        { status: 400 }
      );
    }

    const explanation = await explainAnswer({
      question,
      chosenChoiceId,
      officerName,
    });

    return NextResponse.json(explanation, { status: 200 });
  } catch (err) {
    console.error("Error in /api/ai/explain-answer:", err);
    return NextResponse.json(
      { error: "Internal server error during answer explanation." },
      { status: 500 }
    );
  }
}
