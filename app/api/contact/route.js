import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { Newsletter } from "@/utils/schema";
import moment from "moment";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  CONTACT_MAX_REQUESTS_PER_HOUR,
  CONTACT_UNKNOWN_IP_MAX_REQUESTS_PER_HOUR,
  CONTACT_WINDOW_MS,
} from "@/lib/limits";

function isValidString(val, maxLength = 2000) {
  return typeof val === "string" && val.trim().length > 0 && val.length <= maxLength;
}

export async function POST(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || null;

    const rateKey = clientIp ? `contact:${clientIp}` : "contact:unknown";
    const rateLimitCount = clientIp
      ? CONTACT_MAX_REQUESTS_PER_HOUR
      : CONTACT_UNKNOWN_IP_MAX_REQUESTS_PER_HOUR;

    const rateCheck = checkRateLimit(rateKey, rateLimitCount, CONTACT_WINDOW_MS);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many contact submissions. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();
    const { name, email, message } = body;

    if (
      !isValidString(name, 2000) ||
      !isValidString(email, 2000) ||
      !isValidString(message, 5000)
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const resp = await db.insert(Newsletter).values({
      newName: name,
      newEmail: email,
      newMessage: message,
      createdAt: moment().format("YYYY-MM-DD"),
    });

    return NextResponse.json({ success: true, resp });
  } catch (err) {
    console.error("Error saving contact message:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
