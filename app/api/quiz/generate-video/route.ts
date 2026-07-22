// import { NextResponse } from 'next/server'
// import { auth } from '@/lib/auth'
// import { generateVideoQuiz, getGeminiKey } from '@/lib/gemini'

// export async function POST(req: Request) {
//   try {
//     const session = await auth()
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { transcript, videoTitle } = await req.json()
//     if (!transcript || !videoTitle) {
//       return NextResponse.json({ error: 'Missing transcript or videoTitle' }, { status: 400 })
//     }

//     const geminiKey = await getGeminiKey(session.user.id)
//     const questions = await generateVideoQuiz(transcript, videoTitle, geminiKey)

//     return NextResponse.json(questions)
//   } catch (error: any) {
//     console.error('[GENERATE_VIDEO_QUIZ]', error)
//     if (error.message === 'GEMINI_KEY_MISSING') {
//       return NextResponse.json({ error: 'Please add your Gemini API key in Settings' }, { status: 400 })
//     }
//     if (error.message === 'QUOTA_EXCEEDED') {
//       return NextResponse.json({ error: 'Quiz generation limit reached for today. Try again tomorrow.' }, { status: 429 })
//     }
//     if (error.message === 'INVALID_KEY') {
//       return NextResponse.json({ error: 'Your Gemini API key is invalid. Check Settings.' }, { status: 400 })
//     }
//     return NextResponse.json({ error: 'Could not generate quiz right now. Skip or try again.' }, { status: 500 })
//   }
// }




import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateVideoQuiz, getGeminiKey } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { transcript, videoTitle } = await req.json();

    if (!transcript || !videoTitle) {
      return NextResponse.json(
        { error: "Missing transcript or videoTitle" },
        { status: 400 }
      );
    }

    // Uses GEMINI_API_KEY from .env.local
    const geminiKey = await getGeminiKey();

    const questions = await generateVideoQuiz(
      transcript,
      videoTitle,
      geminiKey
    );

    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("[GENERATE_VIDEO_QUIZ]", error);

    switch (error.message) {
      case "GEMINI_API_KEY is missing":
      case "GEMINI_KEY_MISSING":
        return NextResponse.json(
          { error: "Server Gemini API key is missing." },
          { status: 500 }
        );

      case "QUOTA_EXCEEDED":
        return NextResponse.json(
          {
            error:
              "Quiz generation limit reached. Please try again later.",
          },
          { status: 429 }
        );

      case "INVALID_KEY":
        return NextResponse.json(
          { error: "Invalid Gemini API key." },
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