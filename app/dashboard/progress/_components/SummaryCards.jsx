"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MessageSquare, Award, Trophy } from "lucide-react";

const SummaryCards = ({ summary }) => {
  const { totalInterviews, totalAnswers, overallAverage, bestScore } = summary || {};

  const cards = [
    {
      title: "Total Interviews",
      value: totalInterviews ?? 0,
      subtext: "Sessions created",
      icon: Briefcase,
    },
    {
      title: "Answers Recorded",
      value: totalAnswers ?? 0,
      subtext: "Responses evaluated",
      icon: MessageSquare,
    },
    {
      title: "Overall Average",
      value: overallAverage !== null && overallAverage !== undefined ? `${overallAverage}` : "Not scored yet",
      suffix: overallAverage !== null && overallAverage !== undefined ? " / 10" : "",
      subtext: "Across all answered questions",
      icon: Award,
      highlight: overallAverage !== null,
    },
    {
      title: "Best Interview Score",
      value: bestScore !== null && bestScore !== undefined ? `${bestScore}` : "Not scored yet",
      suffix: bestScore !== null && bestScore !== undefined ? " / 10" : "",
      subtext: "Highest session average",
      icon: Trophy,
      highlight: bestScore !== null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border border-border/60 bg-card shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {card.title}
                </span>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
