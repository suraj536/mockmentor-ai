import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function normalizeQuestionKey(text) {
  if (typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

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

    // Deduplicate in memory by normalized question key:
    // keep the row with the highest id, but preserve FIRST-seen position
    const firstSeenOrder = [];
    const highestById = new Map();

    for (const row of result) {
      const normKey = normalizeQuestionKey(row.question);
      if (!highestById.has(normKey)) {
        firstSeenOrder.push(normKey);
        highestById.set(normKey, row);
      } else {
        const existing = highestById.get(normKey);
        if (row.id > existing.id) {
          highestById.set(normKey, row);
        }
      }
    }

    const deduplicated = firstSeenOrder.map((key) => highestById.get(key));

    return NextResponse.json(deduplicated);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

