"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Calendar, Play, MessageSquareQuote } from "lucide-react";
import { formatRelativeDate, formatExperience } from "@/lib/utils";

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };

  const onFeedback = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };

  return (
    <Card className="flex flex-col justify-between border-border/60 bg-card hover:border-border transition-all duration-200 shadow-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">
            {interview?.jobPosition}
          </h3>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {formatExperience(interview?.jobExperience)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatRelativeDate(interview?.createdAt)}</span>
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
