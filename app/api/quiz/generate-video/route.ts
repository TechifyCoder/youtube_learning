import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateVideoQuiz, getGeminiKey } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript, videoTitle } = await req.json();

    if (!transcript || !videoTitle) {
      return NextResponse.json(
        { error: "Missing transcript or videoTitle" },
        { status: 400 }
      );
    }

    // BYOK: resolves user's personal key, falls back to platform key
    const geminiKey = await getGeminiKey(session.user.id);
    const questions = await generateVideoQuiz(transcript, videoTitle, geminiKey);

    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("[GENERATE_VIDEO_QUIZ]", error);

    switch (error.message) {
      case "GEMINI_KEY_MISSING":
        return NextResponse.json(
          { error: "No Gemini API key found. Add your key in Settings → API Keys." },
          { status: 400 }
        );
      case "QUOTA_EXCEEDED":
        return NextResponse.json(
          { error: "Quiz generation limit reached. Try again tomorrow." },
          { status: 429 }
        );
      case "INVALID_KEY":
        return NextResponse.json(
          { error: "Invalid Gemini API key. Check Settings → API Keys." },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: "Could not generate quiz right now." },
          { status: 500 }
        );
    }
  }
}