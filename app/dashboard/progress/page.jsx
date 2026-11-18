"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, PlusCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SummaryCards from "./_components/SummaryCards";
import ScoreTrendChart from "./_components/ScoreTrendChart";
import CategoryBreakdown from "./_components/CategoryBreakdown";
import StarSection from "./_components/StarSection";
import RecentInterviewsTable from "./_components/RecentInterviewsTable";

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        throw new Error("Failed to load progress analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

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
          {/* Summary KPIs */}
          <SummaryCards summary={data.summary} />

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
