import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import {
  DAILY_INTERVIEWS_CAP,
  INTERVIEW_CREATE_MAX_PER_HOUR,
  INTERVIEW_CREATE_WINDOW_MS,
} from "@/lib/limits";
import { checkRateLimit } from "@/lib/rateLimit";
import { normalizeQuestionKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

function isValidString(val, maxLength = 2000) {
  return typeof val === "string" && val.trim().length > 0 && val.length <= maxLength;
}

export async function GET() {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, userEmail))
      .orderBy(desc(MockInterview.id))
      .limit(100);

    if (!interviews || interviews.length === 0) {
      return NextResponse.json([]);
    }

    const mockIds = interviews.map((i) => i.mockId);

    const rawAnswers = await db
      .select({
        id: UserAnswer.id,
        mockIdRef: UserAnswer.mockIdRef,
        question: UserAnswer.question,
        rating: UserAnswer.rating,
      })
      .from(UserAnswer)
      .where(
        and(
          inArray(UserAnswer.mockIdRef, mockIds),
          eq(UserAnswer.userEmail, userEmail)
        )
      );

    const answersByMockId = new Map();
    for (const ans of rawAnswers) {
      if (!answersByMockId.has(ans.mockIdRef)) {
        answersByMockId.set(ans.mockIdRef, []);
      }
      answersByMockId.get(ans.mockIdRef).push(ans);
    }

    const result = interviews.map((item) => {
      // Determine interview type from stored jsonMockResp
      let interviewType = "technical";
      try {
        const parsed = JSON.parse(item.jsonMockResp);
        const questionsList = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object"
          ? Object.values(parsed).find((v) => Array.isArray(v)) || []
          : [];
        if (questionsList.some((q) => q?.Type === "behavioral")) {
          interviewType = "behavioral";
        }
      } catch (_) {
        interviewType = "technical";
      }

      // Deduplicate answers by normalized question key, keeping row with highest id
      const mockAnswers = answersByMockId.get(item.mockId) || [];
      const dedupedMap = new Map();
      for (const ans of mockAnswers) {
        const key = normalizeQuestionKey(ans.question);
        const existing = dedupedMap.get(key);
        if (!existing || ans.id > existing.id) {
          dedupedMap.set(key, ans);
        }
      }

      const dedupedAnswers = Array.from(dedupedMap.values());
      const totalAnswers = dedupedAnswers.length;

      let sumRatings = 0;
      let ratingCount = 0;
      for (const ans of dedupedAnswers) {
        if (typeof ans.rating === "number" && !isNaN(ans.rating)) {
          sumRatings += ans.rating;
          ratingCount += 1;
        }
      }

      const averageScore =
        ratingCount > 0
          ? Math.round((sumRatings / ratingCount) * 10) / 10
          : null;

      return {
        id: item.id,
        mockId: item.mockId,
        jobPosition: item.jobPosition,
        jobDesc: item.jobDesc,
        jobExperience: item.jobExperience,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        type: interviewType,
        averageScore,
        totalAnswers,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching interviews:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await auth();
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || null;
    const createRateKey = userId ? `create:${userId}` : (clientIp ? `create:${clientIp}` : "create:unknown");

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

    const today = moment().format("YYYY-MM-DD");
    const existing = await db
      .select({ id: MockInterview.id })
      .from(MockInterview)
      .where(
        and(
          eq(MockInterview.createdBy, userEmail),
          sql`DATE(${MockInterview.createdAt}) = ${today}::date`,
          sql`${MockInterview.jobPosition} NOT LIKE 'Practice:%'`
        )
      );

    if (existing.length >= DAILY_INTERVIEWS_CAP) {
      const secondsUntilMidnight = Math.max(
        1,
        Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
      );
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

    const body = await req.json();
    const { jsonMockResp, jobPosition, jobDesc, jobExperience } = body;

    const experienceStr = jobExperience !== undefined && jobExperience !== null ? String(jobExperience) : "";

    if (
      !isValidString(jsonMockResp, 100000) ||
      !isValidString(jobPosition, 2000) ||
      !isValidString(jobDesc, 2000) ||
      !isValidString(experienceStr, 2000)
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const resp = await db
      .insert(MockInterview)
      .values({
        mockId: uuidv4(),
        jsonMockResp,
        jobPosition,
        jobDesc,
        jobExperience: experienceStr,
        createdBy: userEmail,
        createdAt: moment().format("YYYY-MM-DD"),
      })
      .returning({ mockId: MockInterview.mockId });

    return NextResponse.json(resp);
  } catch (err) {
    console.error("Error creating interview:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
