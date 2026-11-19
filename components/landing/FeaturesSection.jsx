"use client";

import React from "react";
import {
  Brain,
  Mic,
  CheckCircle2,
  Building2,
  SunMoon,
  History,
  Sparkles,
  ArrowUpRight,
  Sliders,
  Award,
  Zap,
} from "lucide-react";
import SectionReveal from "./ui/SectionReveal";
import AudioWaveform from "./ui/AudioWaveform";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white dark:bg-[#0B0914] transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionReveal className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-lavender dark:bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Comprehensive Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">
            Built for Serious Interview Preparation
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted dark:text-neutral-400">
            Practice, evaluate, and refine your interview answers before facing real hiring panels.
          </p>
        </SectionReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Role-Tailored Questions (Wide Hero Bento - 7 cols) */}
          <SectionReveal className="lg:col-span-7" delay={0.05}>
            <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-gradient-to-br from-white via-white to-brand-lavender/50 dark:from-[#131124] dark:via-[#131124] dark:to-brand-primary/5 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform duration-200">
                    <Brain className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted dark:text-neutral-400">
                    Gemini 2.5 Flash
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white">
                  Role-Tailored Questions
                </h3>
                <p className="text-sm text-brand-muted dark:text-neutral-400 leading-relaxed max-w-xl">
                  Dynamic questions generated for your exact job title, tech stack, job description, and years of experience using Gemini 2.5 Flash.
                </p>
              </div>

              {/* Visual Preview Widget */}
              <div className="mt-6 pt-5 border-t border-border/50 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-brand-muted dark:text-neutral-400">
                    Target Stack:
                  </span>
                  {["React", "Next.js 14", "TypeScript", "PostgreSQL", "System Design"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-brand-lavender dark:bg-white/5 border border-[#E8E8F2] dark:border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-dark dark:text-neutral-200"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>

                <div className="rounded-xl bg-white dark:bg-black/30 border border-[#E8E8F2] dark:border-white/10 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-brand-primary" />
                    <span className="font-semibold text-brand-dark dark:text-white">Seniority Profile:</span>
                    <span className="text-brand-muted dark:text-neutral-400">3–5 Years Experience</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Adaptive Difficulty
                  </span>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Card 2: Voice & Audio Recording (5 cols) */}
          <SectionReveal className="lg:col-span-5" delay={0.1}>
            <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-gradient-to-br from-white via-white to-brand-secondary/5 dark:from-[#131124] dark:via-[#131124] dark:to-brand-secondary/5 p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-brand-secondary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-secondary/10 text-sky-500 group-hover:scale-110 transition-transform duration-200">
                    <Mic className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    Live Audio
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white">
                  Voice & Audio Recording
                </h3>
                <p className="text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                  Speak your answers aloud into your microphone with automated transcription to replicate real verbal interview conditions.
                </p>
              </div>

              {/* Visual Preview Widget */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <div className="rounded-xl bg-white dark:bg-black/30 border border-[#E8E8F2] dark:border-white/10 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-dark dark:text-white flex items-center gap-1.5">
                      <Mic className="h-3.5 w-3.5 text-brand-primary" /> Mic Input Active
                    </span>
                    <span className="text-[11px] text-brand-muted dark:text-neutral-400">44.1 kHz PCM</span>
                  </div>
                  <AudioWaveform barCount={26} barColor="bg-sky-500" />
                  <p className="text-[11px] text-brand-muted dark:text-neutral-300 italic truncate">
                    "I design decoupled bounded contexts with event-driven sync..."
                  </p>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Card 3: Instant Scoring & Critique (4 cols) */}
          <SectionReveal className="lg:col-span-4" delay={0.15}>
            <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-white">
                  Instant Scoring & Critique
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                  Receive clear ratings, constructive feedback on areas for improvement, and ideal answers to learn from after every question.
                </p>
              </div>

              {/* Visual Preview */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="rounded-xl bg-brand-lavender/60 dark:bg-white/5 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-brand-muted dark:text-neutral-400">Score</span>
                    <p className="text-xl font-extrabold text-emerald-500">8.9 <span className="text-xs font-normal text-brand-muted">/ 10</span></p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                    Strong Answer
                  </span>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Card 4: Company-Focused Questions (4 cols) */}
          <SectionReveal className="lg:col-span-4" delay={0.2}>
            <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform duration-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-white">
                  Company-Focused Questions
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                  Generate question banks targeting specific companies and question categories to prepare for company-specific interview rounds.
                </p>
              </div>

              {/* Visual Preview */}
              <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
                {["Google", "Amazon", "Meta", "Stripe", "Startups"].map((co) => (
                  <span
                    key={co}
                    className="rounded-lg bg-brand-lavender dark:bg-white/5 border border-border/60 px-2 py-1 text-[11px] font-semibold text-brand-dark dark:text-neutral-200"
                  >
                    {co}
                  </span>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Card 5: Dark & Light Themes (4 cols) */}
          <SectionReveal className="lg:col-span-4" delay={0.25}>
            <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform duration-200">
                  <SunMoon className="h-5 w-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-white">
                  Dark & Light Themes
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                  A distraction-free, accessible design with full dark and light mode support for comfortable daytime or late-night practice.
                </p>
              </div>

              {/* Visual Preview */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between rounded-xl bg-brand-lavender/60 dark:bg-white/5 p-2.5 border border-border/40 text-xs">
                  <span className="font-semibold text-brand-dark dark:text-white">System, Light & Dark</span>
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-brand-primary" />
                    <span className="h-3 w-3 rounded-full bg-neutral-900 border border-neutral-700" />
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Card 6: Session History & Progress (Full 12 cols Bento Footer) */}
          <SectionReveal className="lg:col-span-12" delay={0.3}>
            <div className="group relative rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-gradient-to-r from-white via-brand-lavender/30 to-white dark:from-[#131124] dark:via-[#161329] dark:to-[#131124] p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-brand-primary/40 transition-all duration-300 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform duration-200">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white">
                    Session History & Progress
                  </h3>
                  <p className="text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                    Review all your previous interviews, recorded responses, and feedback summaries anytime right from your dashboard.
                  </p>
                </div>

                <div className="md:col-span-7">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white dark:bg-white/5 border border-border/60 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-brand-muted dark:text-neutral-400">Previous Run</span>
                      <p className="text-sm font-bold text-brand-dark dark:text-white">Frontend Lead</p>
                      <p className="text-xs text-emerald-500 font-semibold">Score 8.7 • 5/5 Answered</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-white/5 border border-border/60 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-brand-muted dark:text-neutral-400">STAR Behavioral</span>
                      <p className="text-sm font-bold text-brand-dark dark:text-white">Engineering Manager</p>
                      <p className="text-xs text-emerald-500 font-semibold">Score 9.1 • Completed</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-white/5 border border-border/60 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-brand-muted dark:text-neutral-400">Retention</span>
                      <p className="text-sm font-bold text-brand-dark dark:text-white">Full Transcripts</p>
                      <p className="text-xs text-brand-primary font-semibold">Stored In Cloud DB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

