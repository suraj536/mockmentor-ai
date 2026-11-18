import { notFound } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";
import { db } from "@/utils/db";
import { SharedReport, MockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rateLimit";
import { normalizeQuestionKey, parseStarFeedback, cn } from "@/lib/utils";
import { Award, AlertCircle, Calendar, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PrintButton from "./_components/PrintButton";
import moment from "moment";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Interview Feedback Report - MockMentor AI",
  description: "Read-only interview feedback report shared via MockMentor AI.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  referrer: "no-referrer",
};

const PUBLIC_READ_LIMIT_PER_MINUTE = 60;
const PUBLIC_READ_WINDOW_MS = 60 * 1000;

export default async function PublicReportPage({ params }) {
  const { token } = params || {};

  // Reject malformed tokens before any hashing: exactly 43 base64url characters [A-Za-z0-9_-]
  if (!token || typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    notFound();
  }

  // Rate-limit per IP (60 requests per minute)
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";

  const rateCheck = checkRateLimit(
    `public:read:${clientIp}`,
    PUBLIC_READ_LIMIT_PER_MINUTE,
    PUBLIC_READ_WINDOW_MS
  );

  if (!rateCheck.success) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-border/60 bg-card p-6 text-center">
          <CardContent className="p-0 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Too Many Requests</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Too many requests from your connection. Please wait a minute and refresh the page.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Hash token to look up the database record
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Query 1: Verify token in sharedReport table
  const shares = await db
    .select({
      id: SharedReport.id,
      mockId: SharedReport.mockId,
      includeAnswers: SharedReport.includeAnswers,
      expiresAt: SharedReport.expiresAt,
      revokedAt: SharedReport.revokedAt,
    })
    .from(SharedReport)
    .where(eq(SharedReport.tokenHash, tokenHash));

  if (!shares || shares.length === 0) {
    notFound();
  }

  const shareRow = shares[0];

  // Uniform 404 for revoked or expired links
  if (shareRow.revokedAt) {
    notFound();
  }

  if (shareRow.expiresAt && new Date(shareRow.expiresAt) <= new Date()) {
    notFound();
  }

  // Query 2: Fetch interview role and date ONLY (strictly omit createdBy, jobDesc, resume)
  const interviewRows = await db
    .select({
      jobPosition: MockInterview.jobPosition,
      createdAt: MockInterview.createdAt,
    })
    .from(MockInterview)
    .where(eq(MockInterview.mockId, shareRow.mockId));

  if (!interviewRows || interviewRows.length === 0) {
    notFound();
  }

  const interview = interviewRows[0];

  // Query 3: Fetch answers and feedback
  // Never select correctAns, userEmail, createdBy or jobDesc
  // userAns is included ONLY when includeAnswers is true
  const selectCols = {
    id: UserAnswer.id,
    question: UserAnswer.question,
    feedback: UserAnswer.feedback,
    rating: UserAnswer.rating,
  };

  if (shareRow.includeAnswers) {
    selectCols.userAns = UserAnswer.userAns;
  }

  const rawAnswers = await db
    .select(selectCols)
    .from(UserAnswer)
    .where(eq(UserAnswer.mockIdRef, shareRow.mockId))
    .orderBy(UserAnswer.id);

  // Deduplicate in memory by normalized question key:
  // keep the row with the highest id, but preserve FIRST-seen position
  const firstSeenOrder = [];
  const highestById = new Map();

  for (const row of rawAnswers) {
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

  const deduplicatedAnswers = firstSeenOrder.map((key) => highestById.get(key));

  // Compute overall score from deduplicated ratings
  const validRatings = deduplicatedAnswers
    .map((item) => Number(item.rating))
    .filter((num) => isFinite(num) && !isNaN(num));

  const numericRating = validRatings.length
    ? Number((validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1))
    : 0;

  const formattedScore = validRatings.length
    ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
    : "N/A";

  let scoreLabel = "Needs practice";
  let scoreBadgeClasses = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  let gaugeStrokeColor = "#f43f5e";

  if (numericRating >= 7.5) {
    scoreLabel = "Strong";
    scoreBadgeClasses = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    gaugeStrokeColor = "#10b981";
  } else if (numericRating >= 5) {
    scoreLabel = "Good foundation";
    scoreBadgeClasses = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    gaugeStrokeColor = "#f59e0b";
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(Math.max(numericRating, 0), 10) / 10) * circumference;

  const formattedDate = interview?.createdAt
    ? moment(interview.createdAt).format("MMMM D, YYYY")
    : "Recent";

  const pdfDocumentTitle = `MockMentor-Feedback-${(interview.jobPosition || "Interview").trim().replace(/\s+/g, "-")}`;

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Public Brand & Actions Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
              M
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight block">
                MockMentor AI
              </span>
              <span className="text-[11px] text-muted-foreground block -mt-0.5">
                Shared Candidate Feedback Report
              </span>
            </div>
          </div>
          <PrintButton title={pdfDocumentTitle} />
        </header>

        {/* Print-only Report Header — hidden on screen */}
        <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MockMentor AI</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Candidate Interview Feedback Report • Confidential
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Main Summary Card */}
        <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                    <Award className="h-3.5 w-3.5" />
                    Evaluation Summary
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
                      scoreBadgeClasses
                    )}
                  >
                    {scoreLabel}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {interview.jobPosition || "Mock Interview"}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground pt-1">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Interviewed on {formattedDate}</span>
                </div>
              </div>

              {/* Circular Score Gauge */}
              <div className="shrink-0 flex flex-col items-center self-start sm:self-auto">
                <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-muted"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke={gaugeStrokeColor}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {formattedScore}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">/ 10</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground mt-1">
                  Overall Score
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Breakdown List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Question Breakdown ({deduplicatedAnswers.length})
            </h2>
            {shareRow.includeAnswers && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                Spoken answers included
              </span>
            )}
          </div>

          {deduplicatedAnswers.map((item, index) => {
            const starParsed = parseStarFeedback(item.feedback);
            const itemRating = Number(item.rating);
            const isGoodRating = isFinite(itemRating) && itemRating >= 7;

            return (
              <Card
                key={item.id || index}
                className="border border-border/60 bg-card shadow-sm overflow-hidden break-inside-avoid"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-primary block">
                        Question #{index + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                        {item.question}
                      </h3>
                    </div>
                    {item.rating !== null && item.rating !== undefined && (
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
                          isGoodRating
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        {item.rating} / 10
                      </span>
                    )}
                  </div>

                  {/* STAR Sub-scores badges (behavioral) */}
                  {starParsed.star && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
                      {[
                        { label: "Situation", val: starParsed.star.S },
                        { label: "Task", val: starParsed.star.T },
                        { label: "Action", val: starParsed.star.A },
                        { label: "Result", val: starParsed.star.R },
                      ].map((comp) => (
                        <span
                          key={comp.label}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/40"
                        >
                          <span className="font-semibold text-primary">{comp.label}:</span>
                          <span>{comp.val}/10</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Candidate Spoken Answer — rendered ONLY when includeAnswers was enabled */}
                  {shareRow.includeAnswers && item.userAns && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5 space-y-1.5 text-xs sm:text-sm">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Candidate's Answer
                      </span>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {item.userAns}
                      </p>
                    </div>
                  )}

                  {/* Feedback Commentary */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1.5 text-xs sm:text-sm">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                      Evaluation & Feedback
                    </span>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {starParsed.text || item.feedback || "No feedback recorded."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="pt-6 pb-8 border-t border-border/60 text-center text-xs text-muted-foreground">
          <p>
            Shared privately via <strong className="text-foreground">MockMentor AI</strong> •
            Candidate interview practice and evaluation.
          </p>
        </footer>
      </div>
    </div>
  );
}

