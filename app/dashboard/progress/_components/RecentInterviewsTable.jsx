"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowRight, MessageSquareQuote, Calendar } from "lucide-react";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";

const getScoreBadge = (score) => {
  if (score === null || score === undefined) {
    return {
      label: "Not scored yet",
      className: "bg-muted text-muted-foreground border-border/60",
    };
  }
  const n = Number(score);
  if (n >= 7.5) {
    return {
      label: `${score} / 10`,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    };
  }
  if (n >= 5.0) {
    return {
      label: `${score} / 10`,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }
  return {
    label: `${score} / 10`,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };
};

const RecentInterviewsTable = ({ interviews }) => {
  const list = interviews || [];

  return (
    <Card className="border border-border/60 bg-card shadow-sm rounded-xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Recent Interview Sessions
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Showing latest {list.length} sessions
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Review previous mock interviews and jump directly to question-by-question feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No recent interviews recorded.
          </p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-3 font-semibold">Job Role / Position</th>
                    <th className="py-3 px-3 font-semibold">Type</th>
                    <th className="py-3 px-3 font-semibold">Date</th>
                    <th className="py-3 px-3 font-semibold">Average Score</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {list.map((item) => {
                    const badge = getScoreBadge(item.averageScore);
                    const isBehavioral = item.type === "behavioral";

                    return (
                      <tr
                        key={item.mockId}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3.5 px-3 font-medium text-foreground">
                          {item.jobPosition || "Interview Session"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                              isBehavioral
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-secondary text-secondary-foreground border-border/60"
                            }`}
                          >
                            {isBehavioral ? "Behavioral (STAR)" : "Technical"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-muted-foreground">
                          {formatRelativeDate(item.createdAt)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            href={`/dashboard/interview/${item.mockId}/feedback`}
                          >
                            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                              <MessageSquareQuote className="h-3.5 w-3.5" />
                              Feedback
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (Clean for 390px, no horizontal scroll) */}
            <div className="md:hidden space-y-3 pt-2">
              {list.map((item) => {
                const badge = getScoreBadge(item.averageScore);
                const isBehavioral = item.type === "behavioral";

                return (
                  <div
                    key={item.mockId}
                    className="p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {item.jobPosition || "Interview Session"}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatRelativeDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/30">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isBehavioral
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary text-secondary-foreground border-border/60"
                        }`}
                      >
                        {isBehavioral ? "STAR Mode" : "Technical"}
                      </span>

                      <Link href={`/dashboard/interview/${item.mockId}/feedback`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          View Feedback
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentInterviewsTable;
