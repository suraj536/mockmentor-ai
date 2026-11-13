import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { Question } from "@/utils/schema";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { DAILY_QUESTIONS_CAP } from "@/lib/limits";

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

    const result = await db
      .select()
      .from(Question)
      .where(eq(Question.createdBy, userEmail))
      .orderBy(desc(Question.id));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching questions:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = moment().format("YYYY-MM-DD");
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
      const secondsUntilMidnight = Math.max(
        1,
        Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
      );
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

    const body = await req.json();
    const {
      MockQuestionJsonResp,
      jobPosition,
      jobDesc,
      jobExperience,
      typeQuestion,
      company,
    } = body;

    const experienceStr = jobExperience !== undefined && jobExperience !== null ? String(jobExperience) : "";

    if (
      !isValidString(MockQuestionJsonResp, 100000) ||
      !isValidString(jobPosition, 2000) ||
      !isValidString(jobDesc, 2000) ||
      !isValidString(experienceStr, 2000) ||
      !isValidString(typeQuestion, 2000) ||
      !isValidString(company, 2000)
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const resp = await db
      .insert(Question)
      .values({
        mockId: uuidv4(),
        MockQuestionJsonResp,
        jobPosition,
        jobDesc,
        jobExperience: experienceStr,
        typeQuestion,
        company,
        createdBy: userEmail,
        createdAt: moment().format("YYYY-MM-DD"),
      })
      .returning({ mockId: Question.mockId });

    return NextResponse.json(resp);
  } catch (err) {
    console.error("Error creating questions:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
