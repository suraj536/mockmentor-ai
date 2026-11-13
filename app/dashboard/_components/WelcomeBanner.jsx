"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

const WelcomeBanner = () => {
  const { user, isLoaded } = useUser();
  const firstName = isLoaded && user?.firstName ? user.firstName : "there";

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>AI-Powered Interview Practice</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        Welcome back, {firstName}! 👋
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
        Create a new mock interview session or review your previous attempts and feedback below.
      </p>
    </div>
  );
};

export default WelcomeBanner;

