"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Target,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SummaryCards from "./_components/SummaryCards";
import ScoreTrendChart from "./_components/ScoreTrendChart";
import CategoryBreakdown from "./_components/CategoryBreakdown";
import StarSection from "./_components/StarSection";
import RecentInterviewsTable from "./_components/RecentInterviewsTable";
import StreakWidget from "../_components/StreakWidget";

const ProgressPage = () => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weakCount, setWeakCount] = useState(null);
  const [isStartingPractice, setIsStartingPractice] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, practiceRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/practice").catch(() => null),
      ]);

      if (!analyticsRes.ok) {
        throw new Error("Failed to load progress analytics");
      }
      const json = await analyticsRes.json();
      setData(json);

      if (practiceRes && practiceRes.ok) {
        const practiceJson = await practiceRes.json();
        setWeakCount(
          typeof practiceJson.count === "number" ? practiceJson.count : null
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartPractice = async () => {
    if (isStartingPractice || weakCount === 0) return;
    setIsStartingPractice(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to create practice session.");
      }
      if (json?.mockId) {
        router.push(`/dashboard/interview/${json.mockId}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to start practice session.");
      setIsStartingPractice(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Performance & Trends
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
            Progress Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Track your scoring trajectory, STAR framework competency, and performance over time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/60 border border-border/40" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 rounded-xl bg-muted/60 border border-border/40" />
            <div className="h-72 rounded-xl bg-muted/60 border border-border/40" />
          </div>
          <div className="h-64 rounded-xl bg-muted/60 border border-border/40" />
          <div className="h-72 rounded-xl bg-muted/60 border border-border/40" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="border border-border/60 bg-card p-8 text-center max-w-lg mx-auto shadow-sm">
          <CardContent className="p-0 space-y-4">
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 w-12 h-12 mx-auto flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Unable to load analytics
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error}
              </p>
            </div>
            <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && data?.summary?.totalInterviews === 0 && (
        <Card className="border border-dashed border-border/80 bg-card p-12 text-center max-w-xl mx-auto shadow-sm rounded-2xl">
          <CardContent className="p-0 space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary w-16 h-16 mx-auto flex items-center justify-center">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                No interview data yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                Complete your first mock interview to track your score progression, compare technical vs behavioral skills, and analyze your STAR storytelling.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Start New Mock Interview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Content State */}
      {!loading && !error && data && data.summary?.totalInterviews > 0 && (
        <div className="space-y-6">
          {/* Habit Consistency: Practice Streaks & Weekly Goal */}
          <StreakWidget variant="compact" />

          {/* Summary KPIs */}
          <SummaryCards summary={data.summary} />

          {/* Targeted Weak Question Practice Section */}
          {data.summary?.overallAverage !== null && weakCount !== null && (
            <div>
              {weakCount > 0 ? (
                <Card className="border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 mt-0.5 sm:mt-0">
                          <Target className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground text-base">
                              Targeted Weak Question Practice
                            </h3>
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {weakCount} {weakCount === 1 ? "question" : "questions"} to improve
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            Practice up to 5 of your lowest-scoring questions (rated 6/10 or below) across all your past interviews to turn your weaknesses into strengths.
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pt-2 sm:pt-0">
                        <Button
                          onClick={handleStartPractice}
                          disabled={isStartingPractice}
                          className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-all"
                        >
                          {isStartingPractice ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Target className="h-4 w-4" />
                          )}
                          Practice Weak Questions ({Math.min(weakCount, 5)})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-base">
                          All caught up! No weak questions found.
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Great job! All your evaluated answers across all interviews are currently scored 7/10 or higher. Keep up the high standard!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Score Trend + Category Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <ScoreTrendChart data={data.scoreTrend} />
            </div>
            <div>
              <CategoryBreakdown categories={data.categories} />
            </div>
          </div>

          {/* STAR Framework Breakdown */}
          <StarSection star={data.star} />

          {/* Recent Sessions Table */}
          <RecentInterviewsTable interviews={data.recentInterviews} />
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
