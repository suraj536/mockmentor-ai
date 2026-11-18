import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import {
  INTERVIEW_CREATE_MAX_PER_HOUR,
  INTERVIEW_CREATE_WINDOW_MS,
} from "@/lib/limits";
import { checkRateLimit } from "@/lib/rateLimit";
import { normalizeQuestionKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mockId = searchParams.get("mockId");

    const baseConditions = [
      eq(MockInterview.createdBy, userEmail),
      eq(UserAnswer.userEmail, userEmail),
      sql`${UserAnswer.rating} IS NOT NULL`,
    ];
    if (mockId && typeof mockId === "string" && mockId.trim().length > 0) {
      baseConditions.push(eq(MockInterview.mockId, mockId.trim()));
    }

    const candidateRows = await db
      .select({
        answerId: UserAnswer.id,
        question: UserAnswer.question,
        rating: UserAnswer.rating,
      })
      .from(UserAnswer)
      .innerJoin(MockInterview, eq(UserAnswer.mockIdRef, MockInterview.mockId))
      .where(and(...baseConditions))
      .orderBy(desc(UserAnswer.id));

    // Deduplicate by normalized key keeping newest answer
    const newestByQuestionKey = new Map();
    for (const row of candidateRows) {
      const key = normalizeQuestionKey(row.question);
      if (!newestByQuestionKey.has(key)) {
        newestByQuestionKey.set(key, row);
      }
    }

    // Filter to rating <= 6
    const weakCandidates = Array.from(newestByQuestionKey.values()).filter((row) => {
      const num = Number(row.rating);
      return isFinite(num) && num <= 6;
    });

    return NextResponse.json({ count: weakCandidates.length });
  } catch (err) {
    console.error("Error checking weak questions:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userEmail = await getUserEmail();
    const { userId } = await auth();
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Enforce hourly creation limit create:${userId}
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || null;
    const createRateKey = userId ? `create:${userId}` : clientIp ? `create:${clientIp}` : "create:unknown";

    const createRateCheck = checkRateLimit(
      createRateKey,
      INTERVIEW_CREATE_MAX_PER_HOUR,
      INTERVIEW_CREATE_WINDOW_MS
    );
    if (!createRateCheck.success) {
      return NextResponse.json(
        {
          error: `Rate limit reached. You can create up to ${INTERVIEW_CREATE_MAX_PER_HOUR} interviews per hour. Please try again later.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(createRateCheck.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { mockId } = body || {};

    // Select candidate answers joining to the user's own interviews
    const baseConditions = [
      eq(MockInterview.createdBy, userEmail),
      eq(UserAnswer.userEmail, userEmail),
      sql`${UserAnswer.rating} IS NOT NULL`,
    ];
    if (mockId && typeof mockId === "string" && mockId.trim().length > 0) {
      baseConditions.push(eq(MockInterview.mockId, mockId.trim()));
    }

    const candidateRows = await db
      .select({
        answerId: UserAnswer.id,
        mockIdRef: UserAnswer.mockIdRef,
        question: UserAnswer.question,
        correctAns: UserAnswer.correctAns,
        rating: UserAnswer.rating,
        createdAt: UserAnswer.createdAt,
        sourceJobPosition: MockInterview.jobPosition,
        sourceJobDesc: MockInterview.jobDesc,
        sourceJobExperience: MockInterview.jobExperience,
        sourceJsonMockResp: MockInterview.jsonMockResp,
      })
      .from(UserAnswer)
      .innerJoin(MockInterview, eq(UserAnswer.mockIdRef, MockInterview.mockId))
      .where(and(...baseConditions))
      .orderBy(desc(UserAnswer.id));

    // Deduplicate by normalized key keeping newest answer (highest id)
    const newestByQuestionKey = new Map();
    for (const row of candidateRows) {
      const key = normalizeQuestionKey(row.question);
      if (!newestByQuestionKey.has(key)) {
        newestByQuestionKey.set(key, row);
      }
    }

    // Filter to rating <= 6
    const weakCandidates = Array.from(newestByQuestionKey.values()).filter((row) => {
      const num = Number(row.rating);
      return isFinite(num) && num <= 6;
    });

    if (weakCandidates.length === 0) {
      return NextResponse.json(
        { error: "No weak questions found to practice (all answers scored above 6/10)." },
        { status: 422 }
      );
    }

    // Sort lowest score first, ties broken by newest first
    weakCandidates.sort((a, b) => {
      const rA = Number(a.rating);
      const rB = Number(b.rating);
      if (rA !== rB) {
        return rA - rB;
      }
      return (b.answerId || 0) - (a.answerId || 0);
    });

    // Select top 5
    const selectedRows = weakCandidates.slice(0, 5);

    // Cache source interview parsed questions
    const mockRespCache = new Map();
    function getQuestionFromSource(mockIdRef, jsonStr, questionText) {
      if (!mockRespCache.has(mockIdRef)) {
        try {
          const parsed = JSON.parse(jsonStr);
          const list = Array.isArray(parsed)
            ? parsed
            : parsed && typeof parsed === "object"
            ? Object.values(parsed).find((v) => Array.isArray(v)) || []
            : [];
          mockRespCache.set(mockIdRef, list);
        } catch (_) {
          mockRespCache.set(mockIdRef, []);
        }
      }
      const list = mockRespCache.get(mockIdRef);
      const targetKey = normalizeQuestionKey(questionText);
      return list.find((q) => normalizeQuestionKey(q?.Question) === targetKey);
    }

    const practiceQuestions = selectedRows.map((row) => {
      const matchedQ = getQuestionFromSource(
        row.mockIdRef,
        row.sourceJsonMockResp,
        row.question
      );

      const type =
        matchedQ?.Type && String(matchedQ.Type).toLowerCase() === "behavioral"
          ? "behavioral"
          : "technical";

      const referenceAnswer =
        typeof row.correctAns === "string" && row.correctAns.trim().length > 0
          ? row.correctAns.trim()
          : typeof matchedQ?.Answer === "string" && matchedQ.Answer.trim().length > 0
          ? matchedQ.Answer.trim()
          : "No reference answer available.";

      return {
        Question: row.question.trim(),
        Answer: referenceAnswer,
        Type: type,
      };
    });

    let jobPosition;
    let jobDesc;
    let jobExperience;

    if (mockId && typeof mockId === "string" && mockId.trim().length > 0) {
      const sourceJobPosition = selectedRows[0].sourceJobPosition || "Interview";
      const cleanPosition = sourceJobPosition.replace(/^(Practice:\s*)+/i, "").trim() || "Interview";
      jobPosition = `Practice: ${cleanPosition}`;
      jobDesc = selectedRows[0].sourceJobDesc || "Targeted practice session.";
      jobExperience = selectedRows[0].sourceJobExperience || "1";
    } else {
      jobPosition = "Practice: Weak Questions";
      jobDesc = "Targeted practice session focusing on your lowest-scored questions from past interviews.";
      jobExperience = "Various";
    }

    const newMockId = uuidv4();
    await db.insert(MockInterview).values({
      mockId: newMockId,
      jsonMockResp: JSON.stringify(practiceQuestions),
      jobPosition,
      jobDesc,
      jobExperience: String(jobExperience),
      createdBy: userEmail,
      createdAt: moment().format("YYYY-MM-DD"),
    });

    return NextResponse.json({ mockId: newMockId });
  } catch (err) {
    console.error("Error creating practice session:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

