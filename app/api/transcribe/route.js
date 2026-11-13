import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  GEMINI_MAX_REQUESTS_PER_HOUR,
  GEMINI_WINDOW_MS,
} from "@/lib/limits";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(
      `gemini:${userId}`,
      GEMINI_MAX_REQUESTS_PER_HOUR,
      GEMINI_WINDOW_MS
    );
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Rate limit reached. You can make up to ${GEMINI_MAX_REQUESTS_PER_HOUR} AI requests per hour. Please try again later.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    const { base64Audio, mimeType } = await req.json();

    if (!base64Audio) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      "Transcribe the following audio:",
      { inlineData: { data: base64Audio, mimeType: mimeType || "audio/webm" } },
    ]);

    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
