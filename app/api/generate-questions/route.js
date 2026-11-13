import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  GEMINI_MAX_REQUESTS_PER_HOUR,
  GEMINI_WINDOW_MS,
  DAILY_INTERVIEWS_CAP,
  DAILY_QUESTIONS_CAP,
} from "@/lib/limits";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, Question } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import moment from "moment";

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

    const body = await req.json();
    const { mode, jobPosition, jobDesc, jobExperience, typeQuestion, company } =
      body;

    const userEmail = await getUserEmail();
    if (userEmail) {
      const today = moment().format("YYYY-MM-DD");
      const secondsUntilMidnight = Math.max(
        1,
        Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
      );

      if (mode === "questions") {
        const existing = await db
          .select({ id: Question.id })
          .from(Question)
          .where(
            and(
              eq(Question.createdBy, userEmail),
              eq(Question.createdAt, today)
            )
          );
        if (existing.length >= DAILY_QUESTIONS_CAP) {
          return NextResponse.json(
            {
              error: `Daily limit reached. You can create up to ${DAILY_QUESTIONS_CAP} question sets per day.`,
            },
            {
              status: 429,
              headers: { "Retry-After": String(secondsUntilMidnight) },
            }
          );
        }
      } else {
        const existing = await db
          .select({ id: MockInterview.id })
          .from(MockInterview)
          .where(
            and(
              eq(MockInterview.createdBy, userEmail),
              eq(MockInterview.createdAt, today)
            )
          );
        if (existing.length >= DAILY_INTERVIEWS_CAP) {
          return NextResponse.json(
            {
              error: `Daily limit reached. You can create up to ${DAILY_INTERVIEWS_CAP} mock interviews per day.`,
            },
            {
              status: 429,
              headers: { "Retry-After": String(secondsUntilMidnight) },
            }
          );
        }
      }
    }

    let InputPrompt;
    if (mode === "questions") {
      InputPrompt = `
    Job Positions: ${jobPosition},
    Job Description: ${jobDesc},
    Years of Experience: ${jobExperience},
    Which type of question: ${typeQuestion},
    This company previous question: ${company},
    Based on this information, please provide 5 interview questions with answers in JSON format.
    Each question and answer should be fields in the JSON. Ensure "Question" and "Answer" are fields.
}  
  `;
    } else {
      InputPrompt = `
  Job Positions: ${jobPosition}, 
  Job Description: ${jobDesc}, 
  Years of Experience: ${jobExperience}. 
  Based on this information, please provide 5 interview questions with answers in JSON format, ensuring "Question" and "Answer" are fields in the JSON.
`;
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

    const result = await model.generateContent(InputPrompt);
    const rawText = result.response.text();
    const MockJsonResp = rawText
      .replace("```json", "")
      .replace("```", "")
      .trim();

    return NextResponse.json({ jsonResponse: MockJsonResp });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
