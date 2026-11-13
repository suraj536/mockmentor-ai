import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { Question } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pyqId } = params;
    if (!pyqId || typeof pyqId !== "string") {
      return NextResponse.json({ error: "Invalid pyqId" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(Question)
      .where(
        and(
          eq(Question.mockId, pyqId),
          eq(Question.createdBy, userEmail)
        )
      );

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching question details:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

