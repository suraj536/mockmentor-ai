"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Lightbulb, AlertTriangle } from "lucide-react";

const StarSection = ({ star }) => {
  const { hasData, situation, task, action, result, weakest, advice } = star || {};

  const components = [
    { key: "S", label: "Situation", val: situation, desc: "Context & background" },
    { key: "T", label: "Task", val: task, desc: "Role & core challenges" },
    { key: "A", label: "Action", val: action, desc: "Specific steps taken" },
    { key: "R", label: "Result", val: result, desc: "Measurable outcomes" },
  ];

  return (
    <Card className="border border-border/60 bg-card shadow-sm rounded-xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            STAR Framework Breakdown
          </CardTitle>
          {hasData && weakest && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-3 w-3" />
              Focus area: {weakest}
            </span>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Average scoring across the 4 pillars of behavioral storytelling
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        {!hasData ? (
          <div className="p-6 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
            <p className="text-sm font-semibold text-foreground">
              No Behavioral (STAR) data recorded yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Start a Behavioral (STAR) mock interview to evaluate your Situation, Task, Action, and Result competency.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {components.map((comp) => {
                const isWeakest = comp.label === weakest;
                const scorePercent =
                  comp.val !== null && comp.val !== undefined
                    ? Math.min(100, Math.max(0, (comp.val / 10) * 100))
                    : 0;

                return (
                  <div
                    key={comp.key}
                    className={`p-4 rounded-xl border transition-all ${
                      isWeakest
                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30"
                        : "bg-muted/30 border-border/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {comp.label}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isWeakest
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {comp.val !== null ? `${comp.val} / 10` : "—"}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground mb-3">
                      {comp.desc}
                    </p>

                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeakest ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {advice && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Improvement Tip: {weakest}
                  </h5>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {advice}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StarSection;
