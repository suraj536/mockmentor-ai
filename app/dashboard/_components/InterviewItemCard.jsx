"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Calendar, Play, MessageSquareQuote, Trash2 } from "lucide-react";
import { formatRelativeDate, formatExperience } from "@/lib/utils";

const InterviewItemCard = ({ interview, onDelete }) => {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };

  const onFeedback = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };

  const isBehavioral = (interview?.type || "").toLowerCase() === "behavioral";
  const hasScore = typeof interview?.averageScore === "number" && !isNaN(interview?.averageScore);

  return (
    <Card className="flex flex-col justify-between border-border/60 bg-card hover:border-border transition-all duration-200 shadow-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                  isBehavioral
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                }`}
              >
                {isBehavioral ? "Behavioral" : "Technical"}
              </span>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                {hasScore ? `${interview.averageScore} / 10` : "Unscored"}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">
              {interview?.jobPosition}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(interview);
            }}
            aria-label={`Delete ${interview?.jobPosition || "mock"} interview`}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelativeDate(interview?.createdAt)}</span>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {formatExperience(interview?.jobExperience)}
          </span>
        </div>
      </CardHeader>

      <CardFooter className="p-5 pt-2 flex gap-3">
        <Button
          onClick={onFeedback}
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
        >
          <MessageSquareQuote className="h-4 w-4" />
          Feedback
        </Button>
        <Button
          onClick={onStart}
          size="sm"
          className="w-full gap-1.5"
        >
          <Play className="h-4 w-4" />
          Start
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewItemCard;
