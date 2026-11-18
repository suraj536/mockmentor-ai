"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
  Award,
  Download,
  Sparkles,
  LoaderCircle,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { formatExperience, parseStarFeedback, cn } from "@/lib/utils";
import ShareReportDialog from "./_components/ShareReportDialog";

// Fast string hash (djb2) to fingerprint full candidate answer text
function stringHash(str) {
  let hash = 5381;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash >>> 0).toString(16);
}

// Untrusted sessionStorage cache reader with structural validation
function getCachedCoaching(answerId, userAns) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(`mockmentor_coach_${answerId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const currentHash = stringHash(userAns || "");
    if (parsed?.ansHash !== currentHash) {
      window.sessionStorage.removeItem(`mockmentor_coach_${answerId}`);
      return null;
    }
    const data = parsed?.data;
    if (
      data &&
      Array.isArray(data.tips) &&
      data.tips.length >= 2 &&
      data.tips.length <= 4 &&
      data.tips.every(
        (t) => typeof t === "string" && t.trim().length >= 10 && t.trim().length <= 350
      ) &&
      typeof data.improvedAnswer === "string" &&
      data.improvedAnswer.trim().length >= 20 &&
      data.improvedAnswer.trim().length <= 3000
    ) {
      return {
        tips: data.tips.map((t) => t.trim()),
        improvedAnswer: data.improvedAnswer.trim(),
      };
    }
    window.sessionStorage.removeItem(`mockmentor_coach_${answerId}`);
    return null;
  } catch (_) {
    return null;
  }
}

function setCachedCoaching(answerId, userAns, data) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    const currentHash = stringHash(userAns || "");
    window.sessionStorage.setItem(
      `mockmentor_coach_${answerId}`,
      JSON.stringify({ ansHash: currentHash, data })
    );
  } catch (_) {}
}

// Plain React highlighter for [bracketed placeholders] — zero dangerouslySetInnerHTML
function renderHighlightedAnswer(text) {
  if (typeof text !== "string") return null;
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, index) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <span
          key={index}
          className="inline-block font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded text-xs sm:text-sm my-0.5"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const afterprintCleanupRef = useRef(null);

  // Per-answer Coaching States
  const [coachingData, setCoachingData] = useState({});
  const [coachingLoading, setCoachingLoading] = useState({});
  const [coachingErrors, setCoachingErrors] = useState({});
  const [coachingCollapsed, setCoachingCollapsed] = useState({});
  const [copiedAnswerId, setCopiedAnswerId] = useState(null);
  const [isStartingPractice, setIsStartingPractice] = useState(false);

  const weakCount = useMemo(() => {
    return feedbackList.filter((item) => {
      if (item.rating === null || item.rating === undefined) return false;
      const num = Number(item.rating);
      return !isNaN(num) && num <= 6;
    }).length;
  }, [feedbackList]);

  const handleStartPractice = async () => {
    if (isStartingPractice || weakCount === 0) return;
    setIsStartingPractice(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockId: params.interviewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create practice session.");
      }
      if (data?.mockId) {
        router.push(`/dashboard/interview/${data.mockId}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to start practice session.");
      setIsStartingPractice(false);
    }
  };

  useEffect(() => {
    GetFeedback();
    GetInterviewDetails();
  }, []);

  // Clean up afterprint listener on unmount
  useEffect(() => {
    return () => {
      if (afterprintCleanupRef.current) {
        afterprintCleanupRef.current();
        afterprintCleanupRef.current = null;
      }
    };
  }, []);

  // 429 cooldown countdown timer
  useEffect(() => {
    const hasCooldown = Object.values(coachingErrors).some(
      (e) => e?.is429 && e.cooldownSec > 0
    );
    if (!hasCooldown) return;

    const timer = setInterval(() => {
      setCoachingErrors((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id in next) {
          if (next[id]?.is429 && next[id].cooldownSec > 0) {
            changed = true;
            next[id] = {
              ...next[id],
              cooldownSec: next[id].cooldownSec - 1,
            };
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [coachingErrors]);

  const GetFeedback = async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}/feedback`);
      if (res.ok) {
        const result = await res.json();
        setFeedbackList(result);

        // Populate cached coaching from sessionStorage for items matching current answer hash
        const initialCoaching = {};
        for (const item of result) {
          if (item?.id && item?.userAns) {
            const cached = getCachedCoaching(item.id, item.userAns);
            if (cached) {
              initialCoaching[item.id] = cached;
            }
          }
        }
        setCoachingData(initialCoaching);
      } else {
        setFeedbackList([]);
      }
    } catch (err) {
      console.error(err);
      setFeedbackList([]);
    }
  };

  const GetInterviewDetails = async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}`);
      if (res.ok) {
        const result = await res.json();
        if (result && result[0]) {
          setInterviewData(result[0]);
        }
      }
    } catch (err) {
      // Gracefully ignore — job details are optional for the print header
      console.error(err);
    }
  };

  const handleCoachClick = async (item) => {
    const answerId = item.id;
    const userAns = item.userAns;

    // Clear previous error
    setCoachingErrors((prev) => {
      const next = { ...prev };
      delete next[answerId];
      return next;
    });

    // Check cache first
    const cached = getCachedCoaching(answerId, userAns);
    if (cached) {
      setCoachingData((prev) => ({ ...prev, [answerId]: cached }));
      setCoachingCollapsed((prev) => ({ ...prev, [answerId]: false }));
      return;
    }

    setCoachingLoading((prev) => ({ ...prev, [answerId]: true }));

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: params.interviewId,
          answerId: answerId,
        }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const errJson = await res.json().catch(() => ({}));
        const cooldownSec = retryAfter ? Number(retryAfter) : 60;
        setCoachingErrors((prev) => ({
          ...prev,
          [answerId]: {
            message:
              errJson.error ||
              "Rate limit reached. You can make up to 60 AI requests per hour.",
            is429: true,
            cooldownSec: isFinite(cooldownSec) ? cooldownSec : 60,
          },
        }));
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setCoachingErrors((prev) => ({
          ...prev,
          [answerId]: {
            message:
              errJson.error ||
              "Failed to generate coaching suggestions. Please try again.",
            is429: false,
          },
        }));
        return;
      }

      const data = await res.json();
      if (
        data &&
        Array.isArray(data.tips) &&
        data.tips.length >= 2 &&
        data.tips.length <= 4 &&
        typeof data.improvedAnswer === "string"
      ) {
        const validPayload = {
          tips: data.tips.map((t) => String(t).trim()),
          improvedAnswer: String(data.improvedAnswer).trim(),
        };
        setCoachingData((prev) => ({ ...prev, [answerId]: validPayload }));
        setCachedCoaching(answerId, userAns, validPayload);
        setCoachingCollapsed((prev) => ({ ...prev, [answerId]: false }));
      } else {
        throw new Error("Invalid coaching response structure");
      }
    } catch (err) {
      console.error("Coaching fetch error:", err);
      setCoachingErrors((prev) => ({
        ...prev,
        [answerId]: {
          message: "Failed to connect. Please check your connection and try again.",
          is429: false,
        },
      }));
    } finally {
      setCoachingLoading((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  const handleCopy = async (answerId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAnswerId(answerId);
      setTimeout(() => {
        setCopiedAnswerId((cur) => (cur === answerId ? null : cur));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const overallRating = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const totalRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.rating),
        0
      );
      return (totalRating / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  const hasValidAnswers =
    feedbackList &&
    feedbackList.length > 0 &&
    !isNaN(Number(overallRating)) &&
    isFinite(Number(overallRating));

  const numericRating = Number(overallRating);
  let scoreLabel = "Needs practice";
  let scoreBadgeClasses =
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  let gaugeStrokeColor = "#f43f5e";

  if (numericRating >= 7.5) {
    scoreLabel = "Strong";
    scoreBadgeClasses =
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    gaugeStrokeColor = "#10b981";
  } else if (numericRating >= 5) {
    scoreLabel = "Good foundation";
    scoreBadgeClasses =
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    gaugeStrokeColor = "#f59e0b";
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(Math.max(numericRating, 0), 10) / 10) * circumference;

  const handlePrint = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const jobPos = interviewData?.jobPosition
      ? interviewData.jobPosition.trim().replace(/\s+/g, "-")
      : "Report";
    const pdfTitle = `MockMentor-${jobPos}-${dateStr}`;

    const originalTitle = document.title;
    document.title = pdfTitle;

    // Clean up any existing listener first
    if (afterprintCleanupRef.current) {
      afterprintCleanupRef.current();
    }

    const handleAfterPrint = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", handleAfterPrint);
      afterprintCleanupRef.current = null;
    };

    window.addEventListener("afterprint", handleAfterPrint);
    afterprintCleanupRef.current = () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };

    window.print();
  };

  // Print-only date string
  const printDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {!hasValidAnswers ? (
        <Card className="border border-border/60 bg-card p-10 text-center max-w-xl mx-auto my-12 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 rounded-full bg-muted w-14 h-14 mx-auto mb-4 flex items-center justify-center text-muted-foreground">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              No answers recorded yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              No interview feedback record was found for this session. Complete
              questions during an interview to view scoring and feedback.
            </p>
            <Button
              onClick={() => router.replace("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Print-only Report Header — hidden on screen */}
          <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MockMentor AI</h1>
                <p className="text-sm text-gray-500 mt-0.5">Interview Feedback Report</p>
              </div>
              <div className="text-right text-sm text-gray-600 space-y-0.5">
                <p className="font-medium">{printDate}</p>
              </div>
            </div>
            {(interviewData?.jobPosition || interviewData?.jobExperience) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
                {interviewData?.jobPosition && (
                  <span>
                    <strong>Role:</strong> {interviewData.jobPosition}
                  </span>
                )}
                {interviewData?.jobExperience && (
                  <span>
                    <strong>Experience:</strong>{" "}
                    {formatExperience(interviewData.jobExperience)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Header & Score Gauge Card */}
          <Card className="border border-border/60 bg-card shadow-sm mb-8 overflow-hidden print-color-exact">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="space-y-3 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                      <Award className="h-3.5 w-3.5" />
                      Interview Summary
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${scoreBadgeClasses}`}
                    >
                      {scoreLabel}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Here is your interview feedback
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Find below each interview question with your answer, the
                    ideal answer, and suggestions for improvement.
                  </p>
                </div>

                {/* Circular Score Gauge */}
                <div className="shrink-0 flex flex-col items-center print-color-exact">
                  <div className="relative flex items-center justify-center w-32 h-32">
                    <svg
                      className="w-full h-full -rotate-90 transform"
                      viewBox="0 0 120 120"
                    >
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
                      <span className="text-2xl font-bold tracking-tight text-foreground">
                        {overallRating}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / 10
                      </span>
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Question Breakdown
            </h2>

            {feedbackList.map((item, index) => {
              const parsed = parseStarFeedback(item.feedback);
              const answerCoaching = coachingData[item.id];
              const isLoadingCoaching = !!coachingLoading[item.id];
              const coachError = coachingErrors[item.id];
              const isCollapsed = !!coachingCollapsed[item.id];

              return (
                <Collapsible
                  key={item.id || index}
                  className="feedback-question-card border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="p-4 sm:p-5 w-full flex items-center justify-between gap-4 text-left hover:bg-muted/40 transition-colors cursor-pointer print:cursor-default print:hover:bg-transparent">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">
                        Q{index + 1}
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-foreground">
                        {item.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          Number(item.rating) >= 7.5
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : Number(item.rating) >= 5
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.rating}/10
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 print:hidden" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="feedback-question-content p-4 sm:p-5 pt-0 space-y-3 border-t border-border/40 mt-1">
                    {/* Your Answer */}
                    <div className="rounded-lg p-3.5 bg-muted/40 border border-border/40 space-y-1">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                        Your Answer
                      </span>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {item.userAns || "No answer recorded."}
                      </p>
                    </div>

                    {/* Ideal Answer */}
                    <div className="rounded-lg p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                        Ideal Answer
                      </span>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {item.correctAns}
                      </p>
                    </div>

                    {/* Feedback */}
                    <div className="rounded-lg p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-1">
                      {parsed.star ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                              Feedback
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                                Situation {parsed.star.S}/10
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                                Task {parsed.star.T}/10
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                                Action {parsed.star.A}/10
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/60">
                                Result {parsed.star.R}/10
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {parsed.text}
                          </p>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                            Feedback
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {item.feedback}
                          </p>
                        </>
                      )}
                    </div>

                    {/* AI Coaching Module */}
                    <div className="pt-2 border-t border-border/40 space-y-3">
                      {!answerCoaching ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 print:hidden">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCoachClick(item)}
                              disabled={
                                isLoadingCoaching ||
                                !item.userAns ||
                                item.userAns.trim().length < 5 ||
                                (coachError?.is429 && coachError?.cooldownSec > 0)
                              }
                              className="gap-1.5 text-xs font-medium border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50"
                            >
                              {isLoadingCoaching ? (
                                <>
                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                  <span>Analyzing your answer...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                                  <span>How to improve this answer</span>
                                </>
                              )}
                            </Button>

                            {(!item.userAns || item.userAns.trim().length < 5) && (
                              <span className="text-xs text-muted-foreground">
                                No answer recorded to coach
                              </span>
                            )}
                          </div>

                          {/* Screen-reader live region for loading */}
                          {isLoadingCoaching && (
                            <span aria-live="polite" className="sr-only">
                              Analyzing your answer and generating coaching suggestions...
                            </span>
                          )}

                          {/* Error Alert with Cooldown and Retry */}
                          {coachError && (
                            <div
                              role="alert"
                              aria-live="assertive"
                              className="rounded-lg p-3 bg-destructive/10 border border-destructive/20 text-xs text-destructive flex flex-wrap items-center justify-between gap-2 print:hidden"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>
                                  {coachError.message}
                                  {coachError.is429 && coachError.cooldownSec > 0
                                    ? ` (Retry in ${coachError.cooldownSec}s)`
                                    : ""}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCoachClick(item)}
                                disabled={
                                  isLoadingCoaching ||
                                  (coachError.is429 && coachError.cooldownSec > 0)
                                }
                                className="h-7 px-2.5 text-xs gap-1 border-destructive/30 hover:bg-destructive/10"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Retry
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Screen Header Controls — Hidden in print */}
                          <div className="flex items-center justify-between print:hidden">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <Sparkles className="h-3 w-3" />
                              Coaching Generated
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setCoachingCollapsed((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                            >
                              {isCollapsed ? (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  Show Coaching
                                </>
                              ) : (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  Hide Coaching
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Coaching Panel — Forces print:block even if collapsed on screen */}
                          <div
                            className={cn(
                              "rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-4 sm:p-5 space-y-4 print:border-gray-300 print:bg-white",
                              isCollapsed ? "hidden print:block" : "block"
                            )}
                          >
                            <div className="flex items-center justify-between border-b border-indigo-500/15 pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                                <h4 className="font-semibold text-sm text-foreground">
                                  AI Answer Coaching
                                </h4>
                              </div>
                              <span className="text-[11px] text-muted-foreground hidden sm:inline print:hidden">
                                Based on your answer
                              </span>
                            </div>

                            {/* Section 1: Specific Tips */}
                            <div className="space-y-2">
                              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                Key Improvements
                              </span>
                              <div className="grid grid-cols-1 gap-2 pt-0.5">
                                {answerCoaching.tips.map((tip, tipIdx) => (
                                  <div
                                    key={tipIdx}
                                    className="flex items-start gap-2.5 rounded-lg bg-card/80 dark:bg-card/50 border border-border/50 p-2.5 text-xs sm:text-sm text-foreground shadow-xs"
                                  >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                      {tipIdx + 1}
                                    </span>
                                    <p className="leading-relaxed pt-0.5">{tip}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 2: Polished Version */}
                            <div className="space-y-2 pt-1 border-t border-indigo-500/15">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                                  Stronger Version (Using Your Facts Only)
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopy(item.id, answerCoaching.improvedAnswer)}
                                  className="h-7 text-xs gap-1.5 print:hidden bg-background"
                                >
                                  {copiedAnswerId === item.id ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 font-medium">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-lg p-3 sm:p-4 bg-background/80 dark:bg-background/60 border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                                {renderHighlightedAnswer(answerCoaching.improvedAnswer)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Print-only footer — hidden on screen */}
          <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-400">Generated by MockMentor AI</p>
          </div>

          {/* Action Navigation — hidden in print */}
          <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
            <Button
              onClick={() => router.replace("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
              aria-label="Download feedback as PDF"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
            <ShareReportDialog interviewId={params.interviewId} />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleStartPractice}
                disabled={weakCount === 0 || isStartingPractice}
                className="gap-2 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                aria-label={`Practice weak questions (${weakCount})`}
              >
                {isStartingPractice ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-amber-500" />
                ) : (
                  <Target className="h-4 w-4 text-amber-500" />
                )}
                Practice weak questions ({weakCount})
              </Button>
              {weakCount === 0 && (
                <span className="text-xs text-muted-foreground">
                  (All answers scored &gt; 6/10)
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
