"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Trophy, Target, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import moment from "moment";

const VALID_GOALS = [5, 10, 15, 20];
const DEFAULT_GOAL = 10;

function parseValidGoal(val) {
  const num = Number(val);
  return VALID_GOALS.includes(num) ? num : null;
}

export default function StreakWidget({ variant = "dashboard" }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Read goal: Clerk metadata first, then localStorage, then default 10
  const initialGoal = useMemo(() => {
    const clerkGoal = parseValidGoal(user?.unsafeMetadata?.weeklyGoal);
    if (clerkGoal !== null) return clerkGoal;

    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("mockmentor_weekly_goal");
        const localGoal = parseValidGoal(stored);
        if (localGoal !== null) return localGoal;
      }
    } catch (_) {}

    return DEFAULT_GOAL;
  }, [user?.unsafeMetadata?.weeklyGoal]);

  const [goal, setGoal] = useState(initialGoal);

  useEffect(() => {
    setGoal(initialGoal);
  }, [initialGoal]);

  const handleGoalChange = async (target) => {
    const valid = parseValidGoal(target);
    if (!valid || valid === goal) return;

    // Optimistically update local state
    setGoal(valid);

    // Save to localStorage safely
    try {
      window.localStorage.setItem("mockmentor_weekly_goal", String(valid));
    } catch (_) {}

    // Update Clerk user metadata
    if (user && typeof user.update === "function") {
      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            weeklyGoal: valid,
          },
        });
      } catch (err) {
        console.error("Clerk metadata sync failed:", err);
        toast.info("Saved locally. We'll sync with your profile when you're back online.");
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchStreaks() {
      try {
        const clientDate = moment().format("YYYY-MM-DD");
        const res = await fetch(`/api/streaks?clientDate=${clientDate}`);
        if (!res.ok) {
          throw new Error("Failed to load streak data");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          // Hide widget quietly on error
          setHasError(true);
          setLoading(false);
        }
      }
    }
    fetchStreaks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hide widget quietly on error or if unmounted before data
  if (hasError || (!loading && !data)) {
    return null;
  }

  // Subtle loading skeleton matching card dimensions
  if (loading) {
    return (
      <Card className="border border-border/60 bg-card shadow-sm rounded-xl overflow-hidden animate-pulse">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 rounded-lg bg-muted/60" />
            <div className="h-16 rounded-lg bg-muted/60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = data.currentStreak ?? 0;
  const longestStreak = data.longestStreak ?? 0;
  const weekCount = data.weekCount ?? 0;
  const isActiveToday = Boolean(data.isActiveToday);
  const isGoalReached = weekCount >= goal;

  const streakStatusText = (() => {
    if (currentStreak === 0) {
      return weekCount === 0
        ? "Answer your first question today to start your streak!"
        : "Start a new streak today with a practice question!";
    }
    if (isActiveToday) {
      return "Active today! Great habit consistency.";
    }
    return "Practice today to keep your streak alive!";
  })();

  // Compact variant for the Progress page
  if (variant === "compact") {
    return (
      <Card className="border border-border/60 bg-card shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Streak Column */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-center shrink-0",
                  isActiveToday
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : currentStreak > 0
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-500/80"
                    : "bg-muted border-border/40 text-muted-foreground/60"
                )}
              >
                <Flame
                  className={cn(
                    "h-5 w-5",
                    isActiveToday
                      ? "fill-amber-500 text-amber-500 motion-safe:animate-pulse"
                      : currentStreak > 0
                      ? "fill-amber-500/20 text-amber-500"
                      : "text-muted-foreground/60"
                  )}
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-base tracking-tight">
                    {currentStreak} {currentStreak === 1 ? "day" : "days"}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    streak
                  </span>
                  {longestStreak > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      Best: {longestStreak}d
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {streakStatusText}
                </p>
              </div>
            </div>

            {/* Weekly Goal Column */}
            <div className="space-y-1.5 sm:border-l sm:border-border/40 sm:pl-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Weekly Goal
                </span>
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/40">
                  {VALID_GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGoalChange(g)}
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors",
                        goal === g
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-label={`Set weekly goal to ${g} questions`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div
                role="progressbar"
                aria-valuenow={weekCount}
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-label={`Weekly goal progress: ${weekCount} of ${goal} questions answered`}
                className="w-full h-2 rounded-full bg-muted/80 overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    isGoalReached ? "bg-emerald-500 dark:bg-emerald-400" : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(100, Math.round((weekCount / goal) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{weekCount} / {goal} questions this week</span>
                {isGoalReached && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Done! 🎉
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dashboard variant (default)
  return (
    <Card className="border border-border/60 bg-card shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Streak Section */}
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                "p-3 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                isActiveToday
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : currentStreak > 0
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-500/80"
                  : "bg-muted border-border/40 text-muted-foreground/60"
              )}
            >
              <Flame
                className={cn(
                  "h-6 w-6",
                  isActiveToday
                    ? "fill-amber-500 text-amber-500 motion-safe:animate-pulse"
                    : currentStreak > 0
                    ? "fill-amber-500/20 text-amber-500"
                    : "text-muted-foreground/60"
                )}
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-foreground text-xl sm:text-2xl tracking-tight">
                  {currentStreak}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {currentStreak === 1 ? "day streak" : "days streak"}
                </span>
                {longestStreak > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    Best: {longestStreak} {longestStreak === 1 ? "day" : "days"}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {streakStatusText}
              </p>
            </div>
          </div>

          {/* Weekly Goal Section */}
          <div className="space-y-2 md:border-l md:border-border/40 md:pl-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                Weekly Practice Goal
              </span>
              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
                {VALID_GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGoalChange(g)}
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-md transition-colors",
                      goal === g
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={`Set weekly goal to ${g} questions`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div
              role="progressbar"
              aria-valuenow={weekCount}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-label={`Weekly goal progress: ${weekCount} of ${goal} questions answered`}
              className="w-full h-2.5 rounded-full bg-muted/80 overflow-hidden"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  isGoalReached ? "bg-emerald-500 dark:bg-emerald-400" : "bg-primary"
                )}
                style={{
                  width: `${Math.min(100, Math.round((weekCount / goal) * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground font-semibold">{weekCount}</strong> of {goal} questions answered
              </span>
              {isGoalReached ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Goal reached! 🎉
                </span>
              ) : (
                <span>{Math.max(0, goal - weekCount)} left</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

