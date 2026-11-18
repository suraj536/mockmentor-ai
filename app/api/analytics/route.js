import { NextResponse } from "next/server";
import { getUserEmail } from "@/lib/getUserEmail";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { parseStarFeedback } from "@/lib/utils";

export const dynamic = "force-dynamic";

const starAdviceMap = {
  S: "Provide clearer background context, timeline, and team setup before diving into your tasks.",
  T: "Clarify your specific ownership, responsibilities, and the core challenge you were assigned to solve.",
  A: "Detail the step-by-step actions you personally took, techniques applied, and decisions you made.",
  R: "Quantify your achievements with concrete business impact, measurable metrics, or key lessons learned.",
};

const round1 = (num) => Math.round(num * 10) / 10;

function normalizeQuestionKey(text) {
  if (typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ");
}

export async function GET() {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Query 1: newest 100 interviews for this user
    const interviewsDesc = await db
      .select({
        id: MockInterview.id,
        mockId: MockInterview.mockId,
        jobPosition: MockInterview.jobPosition,
        createdAt: MockInterview.createdAt,
        jsonMockResp: MockInterview.jsonMockResp,
      })
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, userEmail))
      .orderBy(desc(MockInterview.id))
      .limit(100);

    if (interviewsDesc.length === 0) {
      return NextResponse.json(
        {
          summary: {
            totalInterviews: 0,
            totalAnswers: 0,
            overallAverage: null,
            bestScore: null,
          },
          scoreTrend: [],
          categories: {
            technical: { average: null, count: 0 },
            behavioral: { average: null, count: 0 },
          },
          star: {
            hasData: false,
            situation: null,
            task: null,
            action: null,
            result: null,
            weakest: null,
            advice: null,
          },
          recentInterviews: [],
        },
        {
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Reverse in memory so scoreTrend runs oldest to newest
    const interviews = [...interviewsDesc].reverse();
    const mockIds = interviews.map((item) => item.mockId);
    const mockIdSet = new Set(mockIds);

    // Query 2: answers whose mockIdRef is in this interview list (keyset cursor pagination)
    const ANSWER_BATCH_SIZE = 2500;
    const MAX_ANSWERS_SUPPORTED = 10000;
    const rawAnswers = [];
    let lastAnswerId = 0;

    while (rawAnswers.length < MAX_ANSWERS_SUPPORTED) {
      const batch = await db
        .select({
          id: UserAnswer.id,
          mockIdRef: UserAnswer.mockIdRef,
          question: UserAnswer.question,
          rating: UserAnswer.rating,
          feedback: UserAnswer.feedback,
          createdAt: UserAnswer.createdAt,
        })
        .from(UserAnswer)
        .where(
          lastAnswerId > 0
            ? and(inArray(UserAnswer.mockIdRef, mockIds), gt(UserAnswer.id, lastAnswerId))
            : inArray(UserAnswer.mockIdRef, mockIds)
        )
        .orderBy(asc(UserAnswer.id))
        .limit(ANSWER_BATCH_SIZE);

      if (batch.length === 0) break;
      rawAnswers.push(...batch);
      lastAnswerId = batch[batch.length - 1].id;
      if (batch.length < ANSWER_BATCH_SIZE) break;
    }

    // Detect if additional answers exist beyond the supported maximum of 10,000
    if (rawAnswers.length === MAX_ANSWERS_SUPPORTED) {
      const excessProbe = await db
        .select({ id: UserAnswer.id })
        .from(UserAnswer)
        .where(
          and(
            inArray(UserAnswer.mockIdRef, mockIds),
            gt(UserAnswer.id, lastAnswerId)
          )
        )
        .limit(1);

      if (excessProbe.length > 0) {
        return NextResponse.json(
          { error: "Maximum answer limit exceeded for analytics" },
          {
            status: 400,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }
    }

    // Deduplicate answers by (mockIdRef, normalized question key), keeping the highest id
    // and preserving first-seen order per interview
    const answersByMockId = new Map();
    let totalDeduplicatedAnswers = 0;

    for (const ans of rawAnswers) {
      if (!mockIdSet.has(ans.mockIdRef)) continue;

      let interviewGroup = answersByMockId.get(ans.mockIdRef);
      if (!interviewGroup) {
        interviewGroup = { order: [], map: new Map() };
        answersByMockId.set(ans.mockIdRef, interviewGroup);
      }

      const normKey = normalizeQuestionKey(ans.question);
      if (!interviewGroup.map.has(normKey)) {
        interviewGroup.order.push(normKey);
        interviewGroup.map.set(normKey, ans);
      } else {
        const existing = interviewGroup.map.get(normKey);
        if (ans.id > existing.id) {
          interviewGroup.map.set(normKey, ans);
        }
      }
    }

    for (const group of answersByMockId.values()) {
      totalDeduplicatedAnswers += group.map.size;
    }

    let allValidRatingsSum = 0;
    let allValidRatingsCount = 0;
    let bestInterviewScore = null;

    let techRatingsSum = 0;
    let techRatingsCount = 0;
    let behRatingsSum = 0;
    let behRatingsCount = 0;

    let starSumS = 0;
    let starSumT = 0;
    let starSumA = 0;
    let starSumR = 0;
    let starCount = 0;

    const trendItems = [];
    const interviewStatsList = [];

    for (const item of interviews) {
      // Determine interview type from stored jsonMockResp
      let interviewType = "technical";
      try {
        const parsed = JSON.parse(item.jsonMockResp);
        const questionsList = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object"
          ? Object.values(parsed).find((v) => Array.isArray(v)) || []
          : [];
        if (questionsList.some((q) => q?.Type === "behavioral")) {
          interviewType = "behavioral";
        }
      } catch (_) {
        interviewType = "technical";
      }

      const interviewGroup = answersByMockId.get(item.mockId);
      const answersList = interviewGroup
        ? interviewGroup.order.map((key) => interviewGroup.map.get(key))
        : [];
      const validRatings = [];

      for (const ans of answersList) {
        if (ans.rating !== null && ans.rating !== undefined) {
          const num = Number(ans.rating);
          if (isFinite(num)) {
            validRatings.push(num);
            allValidRatingsSum += num;
            allValidRatingsCount += 1;

            if (interviewType === "behavioral") {
              behRatingsSum += num;
              behRatingsCount += 1;
            } else {
              techRatingsSum += num;
              techRatingsCount += 1;
            }
          }
        }

        // Check for STAR feedback in behavioral answers
        if (interviewType === "behavioral" && ans.feedback) {
          const parsedStar = parseStarFeedback(ans.feedback);
          if (parsedStar.star) {
            starSumS += parsedStar.star.S;
            starSumT += parsedStar.star.T;
            starSumA += parsedStar.star.A;
            starSumR += parsedStar.star.R;
            starCount += 1;
          }
        }
      }

      let interviewAverage = null;
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, r) => acc + r, 0);
        interviewAverage = round1(sum / validRatings.length);

        if (bestInterviewScore === null || interviewAverage > bestInterviewScore) {
          bestInterviewScore = interviewAverage;
        }

        trendItems.push({
          mockId: item.mockId,
          jobPosition: item.jobPosition,
          createdAt: item.createdAt,
          score: interviewAverage,
          type: interviewType,
        });
      }

      interviewStatsList.push({
        mockId: item.mockId,
        jobPosition: item.jobPosition,
        createdAt: item.createdAt,
        averageScore: interviewAverage,
        type: interviewType,
        totalAnswers: answersList.length,
      });
    }

    const overallAverage =
      allValidRatingsCount > 0
        ? round1(allValidRatingsSum / allValidRatingsCount)
        : null;

    const technicalAvg =
      techRatingsCount > 0 ? round1(techRatingsSum / techRatingsCount) : null;
    const behavioralAvg =
      behRatingsCount > 0 ? round1(behRatingsSum / behRatingsCount) : null;

    // STAR breakdown
    let starData = {
      hasData: false,
      situation: null,
      task: null,
      action: null,
      result: null,
      weakest: null,
      advice: null,
    };

    if (starCount > 0) {
      const avgS = round1(starSumS / starCount);
      const avgT = round1(starSumT / starCount);
      const avgA = round1(starSumA / starCount);
      const avgR = round1(starSumR / starCount);

      const components = [
        { key: "S", label: "Situation", avg: avgS },
        { key: "T", label: "Task", avg: avgT },
        { key: "A", label: "Action", avg: avgA },
        { key: "R", label: "Result", avg: avgR },
      ];

      // Weakest component: lowest average, ties broken in S, T, A, R order
      let weakestComp = components[0];
      for (let i = 1; i < components.length; i++) {
        if (components[i].avg < weakestComp.avg) {
          weakestComp = components[i];
        }
      }

      starData = {
        hasData: true,
        situation: avgS,
        task: avgT,
        action: avgA,
        result: avgR,
        weakest: weakestComp.label,
        advice: starAdviceMap[weakestComp.key],
      };
    }

    // Recent interviews: newest first, max 10
    const recentInterviews = [...interviewStatsList].reverse().slice(0, 10);

    return NextResponse.json(
      {
        summary: {
          totalInterviews: interviews.length,
          totalAnswers: totalDeduplicatedAnswers,
          overallAverage,
          bestScore: bestInterviewScore,
        },
        scoreTrend: trendItems,
        categories: {
          technical: { average: technicalAvg, count: techRatingsCount },
          behavioral: { average: behavioralAvg, count: behRatingsCount },
        },
        star: starData,
        recentInterviews,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
