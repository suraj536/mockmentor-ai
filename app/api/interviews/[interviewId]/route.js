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

    const result = await db
      .select()
      .from(MockInterview)
      .where(
        and(
          eq(MockInterview.mockId, interviewId),
          eq(MockInterview.createdBy, userEmail)
        )
      );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching interview details:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    // Verify the interview exists AND createdBy matches
    const existing = await db
      .select({ id: MockInterview.id })
      .from(MockInterview)
      .where(
        and(
          eq(MockInterview.mockId, interviewId),
          eq(MockInterview.createdBy, userEmail)
        )
      );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Delete userAnswer rows with mockIdRef = interviewId (do NOT filter by userEmail)
    await db
      .delete(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, interviewId));

    // Delete the interview filtered by mockId AND createdBy
    await db
      .delete(MockInterview)
      .where(
        and(
          eq(MockInterview.mockId, interviewId),
          eq(MockInterview.createdBy, userEmail)
        )
      );

    return NextResponse.json({ success: true, message: "Interview deleted successfully" });
  } catch (err) {
    console.error("Error deleting interview:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

