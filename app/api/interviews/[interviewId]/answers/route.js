import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import moment from "moment";

function isValidString(val, maxLength = 2000) {
  return typeof val === "string" && val.trim().length > 0 && val.length <= maxLength;
}

export async function POST(req, { params }) {
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

    const body = await req.json();
    const { question, correctAns, userAns, feedback, rating } = body;

    const ratingStr = rating !== undefined && rating !== null ? String(rating) : "";
    const correctAnsStr = typeof correctAns === "string" ? correctAns : "";
    const feedbackStr = typeof feedback === "string" ? feedback : "";

    if (
      !isValidString(question, 2000) ||
      !isValidString(userAns, 20000) ||
      correctAnsStr.length > 20000 ||
      feedbackStr.length > 20000 ||
      ratingStr.length > 2000
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewId,
      question,
      correctAns: correctAnsStr,
      userAns,
      feedback: feedbackStr,
      rating: ratingStr,
      userEmail,
      createdAt: moment().format("YYYY-MM-DD"),
    });

    return NextResponse.json({ success: true, resp });
  } catch (err) {
    console.error("Error recording user answer:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

