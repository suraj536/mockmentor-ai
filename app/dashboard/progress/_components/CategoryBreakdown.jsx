"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2, Users, Layers } from "lucide-react";

const getScoreBadgeClasses = (score) => {
  if (score === null || score === undefined) {
    return "bg-muted text-muted-foreground border-border/60";
  }
  const n = Number(score);
  if (n >= 7.5) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (n >= 5.0) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }
  return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
};

const CategoryBreakdown = ({ categories }) => {
  const { technical, behavioral } = categories || {};

  const items = [
    {
      title: "Technical Interviews",
      icon: Code2,
      average: technical?.average,
      count: technical?.count || 0,
      description: "Role knowledge, coding logic, and architecture",
    },
    {
      title: "Behavioral Interviews",
      icon: Users,
      average: behavioral?.average,
      count: behavioral?.count || 0,
      description: "STAR situational stories, leadership, and collaboration",
    },
  ];

  return (
    <Card className="border border-border/60 bg-card shadow-sm rounded-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Technical vs Behavioral
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Performance comparison across interview modes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-1 space-y-4">
        {items.map((cat, idx) => {
          const Icon = cat.icon;
          const scorePercent =
            cat.average !== null && cat.average !== undefined
              ? Math.min(100, Math.max(0, (cat.average / 10) * 100))
              : 0;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {cat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {cat.count} {cat.count === 1 ? "answer" : "answers"} scored
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreBadgeClasses(
                    cat.average
                  )}`}
                >
                  {cat.average !== null && cat.average !== undefined
                    ? `${cat.average} / 10`
                    : "Not scored yet"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
