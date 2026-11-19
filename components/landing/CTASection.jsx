"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import SectionReveal from "./ui/SectionReveal";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-[#0B0914] transition-colors relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="relative rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/[0.08] via-brand-secondary/[0.06] to-brand-lavender/50 dark:from-brand-primary/15 dark:via-brand-secondary/10 dark:to-transparent p-8 sm:p-14 lg:p-20 text-center shadow-xl overflow-hidden">
            {/* Ambient Background Blur Rings */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-secondary/20 blur-3xl" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white dark:bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                <span>Begin Your Preparation Now</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-dark dark:text-white leading-tight">
                Your Next Interview Starts Here.
              </h2>

              <p className="text-base sm:text-lg text-brand-muted dark:text-neutral-300 max-w-xl mx-auto leading-relaxed">
                Start practicing today and turn your preparation into confidence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 rounded-full bg-brand-primary hover:bg-brand-primaryHover text-white text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-7 rounded-full border-border bg-white dark:bg-white/5 hover:bg-brand-lavender dark:hover:bg-white/10 text-brand-dark dark:text-white text-base font-medium transition-all"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted dark:text-neutral-400 pt-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Zero Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Sub-Second AI Evaluation
                </span>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

