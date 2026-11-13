import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    // Verify interview exists and belongs to this user
    const interview = await db
      .select({ id: MockInterview.id })
      .from(MockInterview)
      .where(
        and(
          eq(MockInterview.mockId, interviewId),
          eq(MockInterview.createdBy, userEmail)
        )
      );

    if (!interview || interview.length === 0) {
      return NextResponse.json({ error: "Interview not found or unauthorized" }, { status: 404 });
    }

    const result = await db
      .select()
      .from(UserAnswer)
      .where(
        and(
          eq(UserAnswer.mockIdRef, interviewId),
          eq(UserAnswer.userEmail, userEmail)
        )
      )
      .orderBy(UserAnswer.id);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

