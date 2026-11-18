import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import moment from "moment";

export const dynamic = "force-dynamic";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function extractDateStr(val) {
  if (!val) return null;
  if (typeof val === "string") {
    const s = val.slice(0, 10);
    return DATE_REGEX.test(s) ? s : null;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  return null;
}

export async function GET(req) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawClientDate = searchParams.get("clientDate");

    // All day math is done strictly in UTC
    const serverUtcToday = moment.utc().format("YYYY-MM-DD");
    let clientDateStr = serverUtcToday;

    // Validate clientDate: must match YYYY-MM-DD, be a real date, and be within 1 day of server UTC
    if (typeof rawClientDate === "string" && DATE_REGEX.test(rawClientDate)) {
      const parsedClient = moment.utc(rawClientDate, "YYYY-MM-DD", true);
      if (parsedClient.isValid()) {
        const serverM = moment.utc(serverUtcToday, "YYYY-MM-DD", true);
        const diffFromUtc = Math.abs(parsedClient.diff(serverM, "days"));
        if (diffFromUtc <= 1) {
          clientDateStr = rawClientDate;
        }
      }
    }

    const clientM = moment.utc(clientDateStr, "YYYY-MM-DD", true);
    const weekStartStr = clientM.clone().startOf("isoWeek").format("YYYY-MM-DD"); // Monday
    const weekEndStr = clientM.clone().endOf("isoWeek").format("YYYY-MM-DD");     // Sunday

    // Query answers bounded by 10,000 rows ordered by id desc.
    // Note: Older history beyond 10,000 rows is not counted.
    const answers = await db
      .select({
        id: UserAnswer.id,
        createdAt: UserAnswer.createdAt,
      })
      .from(UserAnswer)
      .where(eq(UserAnswer.userEmail, userEmail))
      .orderBy(desc(UserAnswer.id))
      .limit(10000);

    let weekCount = 0;
    const distinctDaysSet = new Set();

    for (const row of answers) {
      const storedDateStr = extractDateStr(row.createdAt);
      if (!storedDateStr) continue;

      const storedM = moment.utc(storedDateStr, "YYYY-MM-DD", true);
      if (!storedM.isValid()) continue;

      // Day difference in UTC relative to clientDate (storedDate - clientDate)
      const diffDays = storedM.diff(clientM, "days");

      let effectiveDateStr = storedDateStr;
      if (diffDays === 1) {
        // Stored date is exactly 1 day after clientDate (e.g. west-of-UTC users practicing in the evening)
        effectiveDateStr = clientDateStr;
      } else if (diffDays > 1) {
        // Dates more than 1 day after clientDate are ignored
        continue;
      }

      // Count all answer rows whose clamped date falls in the current Monday to Sunday week
      if (effectiveDateStr >= weekStartStr && effectiveDateStr <= weekEndStr) {
        weekCount++;
      }

      distinctDaysSet.add(effectiveDateStr);
    }

    const sortedDays = Array.from(distinctDaysSet).sort().reverse(); // Newest first
    const yesterdayStr = clientM.clone().subtract(1, "day").format("YYYY-MM-DD");

    const lastActiveDate = sortedDays.length > 0 ? sortedDays[0] : null;
    const isActiveToday = sortedDays.length > 0 && sortedDays[0] === clientDateStr;

    // Current streak: consecutive days ending today or yesterday
    let currentStreak = 0;
    if (sortedDays.length > 0 && (sortedDays[0] === clientDateStr || sortedDays[0] === yesterdayStr)) {
      currentStreak = 1;
      let prevM = moment.utc(sortedDays[0], "YYYY-MM-DD", true);
      for (let i = 1; i < sortedDays.length; i++) {
        const curM = moment.utc(sortedDays[i], "YYYY-MM-DD", true);
        const diff = prevM.diff(curM, "days");
        if (diff === 1) {
          currentStreak++;
          prevM = curM;
        } else {
          break;
        }
      }
    }

    // Longest streak: max consecutive days across entire history
    const ascDays = Array.from(distinctDaysSet).sort(); // Chronological
    let longestStreak = 0;
    if (ascDays.length > 0) {
      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < ascDays.length; i++) {
        const prevM = moment.utc(ascDays[i - 1], "YYYY-MM-DD", true);
        const curM = moment.utc(ascDays[i], "YYYY-MM-DD", true);
        const diff = curM.diff(prevM, "days");
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    return NextResponse.json(
      {
        currentStreak,
        longestStreak,
        weekCount,
        lastActiveDate,
        isActiveToday,
        weekRange: {
          start: weekStartStr,
          end: weekEndStr,
        },
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (err) {
    console.error("Error computing streaks:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

