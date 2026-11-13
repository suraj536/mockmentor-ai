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

    const { question, userAnswer } = await req.json();

    const feedbackPrompt =
      "Question:" +
      question +
      ", User Answer:" +
      userAnswer +
      " , Depends on question and user answer for given interview question" +
      " please give us rating for answer and feedback as area of improvement if any " +
      "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

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

    const result = await model.generateContent(feedbackPrompt);

    let MockJsonResp = result.response.text();
    MockJsonResp = MockJsonResp.replace("```json", "").replace("```", "").trim();

    let jsonFeedbackResp;
    try {
      jsonFeedbackResp = JSON.parse(MockJsonResp);
    } catch (e) {
      throw new Error("Invalid JSON response: " + MockJsonResp);
    }

    return NextResponse.json({
      rating: String(jsonFeedbackResp?.rating ?? ""),
      feedback: jsonFeedbackResp?.feedback ?? "",
    });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
