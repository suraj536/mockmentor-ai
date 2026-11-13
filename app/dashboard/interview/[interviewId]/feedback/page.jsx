"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ArrowLeft, AlertCircle, Award } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const res = await fetch(`/api/interviews/${params.interviewId}/feedback`);
      if (res.ok) {
        const result = await res.json();
        setFeedbackList(result);
      } else {
        setFeedbackList([]);
      }
    } catch (err) {
      console.error(err);
      setFeedbackList([]);
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
          {/* Header & Score Gauge Card */}
          <Card className="border border-border/60 bg-card shadow-sm mb-8 overflow-hidden">
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
                <div className="shrink-0 flex flex-col items-center">
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

            {feedbackList.map((item, index) => (
              <Collapsible
                key={index}
                className="border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="p-4 sm:p-5 w-full flex items-center justify-between gap-4 text-left hover:bg-muted/40 transition-colors cursor-pointer">
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
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 sm:p-5 pt-0 space-y-3 border-t border-border/40 mt-1">
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
                    <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                      Feedback
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.feedback}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Action Navigation */}
          <div className="mt-8 flex justify-start">
            <Button
              onClick={() => router.replace("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
