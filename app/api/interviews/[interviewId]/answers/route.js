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

    let parsedRating = null;
    if (rating !== undefined && rating !== null) {
      const parsed = typeof rating === "number" ? rating : parseFloat(String(rating).trim());
      if (typeof parsed === "number" && isFinite(parsed)) {
        parsedRating = Math.min(10, Math.max(0, Math.round(parsed)));
      }
    }

    if (
      !isValidString(question, 2000) ||
      !isValidString(userAns, 20000) ||
      correctAnsStr.length > 20000 ||
      feedbackStr.length > 20000 ||
      ratingStr.length > 2000
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const resp = await db
      .insert(UserAnswer)
      .values({
        mockIdRef: interviewId,
        question,
        correctAns: correctAnsStr,
        userAns,
        feedback: feedbackStr,
        rating: parsedRating,
        userEmail,
        createdAt: moment().format("YYYY-MM-DD"),
      })
      .returning({ id: UserAnswer.id });

    const insertedId = resp?.[0]?.id ?? null;

    return NextResponse.json({ success: true, resp, id: insertedId });
  } catch (err) {
    console.error("Error recording user answer:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    const body = await req.json();
    const { answerId, userAns, feedback, rating } = body;

    const parsedAnswerId = Number(answerId);
    if (!answerId || !isFinite(parsedAnswerId) || parsedAnswerId <= 0) {
      return NextResponse.json({ error: "Invalid answerId" }, { status: 400 });
    }

    if (
      !isValidString(userAns, 20000) ||
      (feedback !== undefined && typeof feedback !== "string") ||
      (typeof feedback === "string" && feedback.length > 20000)
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const feedbackStr = typeof feedback === "string" ? feedback : "";

    let parsedRating = null;
    if (rating !== undefined && rating !== null) {
      const parsed = typeof rating === "number" ? rating : parseFloat(String(rating).trim());
      if (typeof parsed === "number" && isFinite(parsed)) {
        parsedRating = Math.min(10, Math.max(0, Math.round(parsed)));
      }
    }

    // Ownership check: answer must belong to this user and this interview
    const existing = await db
      .select({
        id: UserAnswer.id,
        userAns: UserAnswer.userAns,
      })
      .from(UserAnswer)
      .where(
        and(
          eq(UserAnswer.id, parsedAnswerId),
          eq(UserAnswer.mockIdRef, interviewId),
          eq(UserAnswer.userEmail, userEmail)
        )
      );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Answer record not found or unauthorized" },
        { status: 404 }
      );
    }

    // Reject second follow-up: if userAns already contains the "---\nFollow-up:" marker, return 409
    const currentAns = existing[0].userAns || "";
    if (currentAns.includes("---\nFollow-up:")) {
      return NextResponse.json(
        { error: "Follow-up already recorded for this question" },
        { status: 409 }
      );
    }

    await db
      .update(UserAnswer)
      .set({
        userAns,
        feedback: feedbackStr,
        rating: parsedRating,
      })
      .where(
        and(
          eq(UserAnswer.id, parsedAnswerId),
          eq(UserAnswer.mockIdRef, interviewId),
          eq(UserAnswer.userEmail, userEmail)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating user answer:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

