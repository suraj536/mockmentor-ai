import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { DAILY_INTERVIEWS_CAP } from "@/lib/limits";

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
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, userEmail))
      .orderBy(desc(MockInterview.id));

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

    const today = moment().format("YYYY-MM-DD");
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
