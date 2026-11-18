import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, SharedReport } from "@/utils/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rateLimit";
import crypto from "crypto";
import moment from "moment";

export const dynamic = "force-dynamic";

const SHARE_CREATE_MAX_PER_HOUR = 20;
const SHARE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    const { userId } = await auth();
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    // Rate limit: 20 per hour per user
    const rateCheck = checkRateLimit(
      `share:create:${userId}`,
      SHARE_CREATE_MAX_PER_HOUR,
      SHARE_WINDOW_MS
    );
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Rate limit reached. You can create up to ${SHARE_CREATE_MAX_PER_HOUR} share links per hour. Please try again later.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    // Verify interview exists and belongs to this user
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
      return NextResponse.json(
        { error: "Interview not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { includeAnswers, expiryDays } = body;

    // Strict validation
    if (typeof includeAnswers !== "boolean") {
      return NextResponse.json(
        { error: "includeAnswers must be a boolean." },
        { status: 400 }
      );
    }

    if (expiryDays !== 7 && expiryDays !== 30 && expiryDays !== null) {
      return NextResponse.json(
        { error: "expiryDays must be exactly 7, 30, or null." },
        { status: 400 }
      );
    }

    // Revoke any previous active links for this interview
    await db
      .update(SharedReport)
      .set({ revokedAt: moment().toISOString() })
      .where(
        and(
          eq(SharedReport.mockId, interviewId),
          eq(SharedReport.createdBy, userEmail),
          sql`${SharedReport.revokedAt} IS NULL`
        )
      );

    // Generate 32 cryptographically secure bytes -> 43 base64url characters
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const createdAt = moment().toISOString();
    const expiresAt = expiryDays ? moment().add(expiryDays, "days").toISOString() : null;

    await db.insert(SharedReport).values({
      tokenHash,
      mockId: interviewId,
      createdBy: userEmail,
      includeAnswers,
      expiresAt,
      createdAt,
    });

    // Return the raw token only once; the server stores only tokenHash
    return NextResponse.json({
      token,
      includeAnswers,
      expiresAt,
      createdAt,
    });
  } catch (err) {
    console.error("Error creating share link:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    const { userId } = await auth();
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    const shares = await db
      .select({
        id: SharedReport.id,
        includeAnswers: SharedReport.includeAnswers,
        expiresAt: SharedReport.expiresAt,
        createdAt: SharedReport.createdAt,
      })
      .from(SharedReport)
      .where(
        and(
          eq(SharedReport.mockId, interviewId),
          eq(SharedReport.createdBy, userEmail),
          sql`${SharedReport.revokedAt} IS NULL`
        )
      )
      .orderBy(desc(SharedReport.id))
      .limit(1);

    if (!shares || shares.length === 0) {
      return NextResponse.json({ activeShare: null });
    }

    const share = shares[0];
    const isExpired = share.expiresAt && new Date(share.expiresAt) <= new Date();
    if (isExpired) {
      return NextResponse.json({ activeShare: null });
    }

    return NextResponse.json({ activeShare: share });
  } catch (err) {
    console.error("Error fetching share status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userEmail = await getUserEmail();
    const { userId } = await auth();
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId } = params;
    if (!interviewId || typeof interviewId !== "string") {
      return NextResponse.json({ error: "Invalid interviewId" }, { status: 400 });
    }

    // Revoke all active shares for this mockId owned by this user
    await db
      .update(SharedReport)
      .set({ revokedAt: moment().toISOString() })
      .where(
        and(
          eq(SharedReport.mockId, interviewId),
          eq(SharedReport.createdBy, userEmail),
          sql`${SharedReport.revokedAt} IS NULL`
        )
      );

    return NextResponse.json({ success: true, message: "Share link revoked successfully" });
  } catch (err) {
    console.error("Error revoking share link:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

