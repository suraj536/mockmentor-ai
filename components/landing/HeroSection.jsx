"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Play,
  Mic,
  CheckCircle2,
  Award,
  Zap,
  Volume2,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AudioWaveform from "./ui/AudioWaveform";

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("technical"); // 'technical' | 'behavioral'

  const previewData = {
    technical: {
      role: "Staff Full-Stack Engineer (5+ YOE)",
      type: "Technical System Design",
      question:
        "How do you design a real-time collaborative workspace with optimistic updates, conflict resolution, and offline resilience in Next.js?",
      answerDuration: "42s recorded",
      transcription:
        "I leverage a hybrid CRDT model combined with optimistic client state in Zustand. On mutation, we apply changes locally and dispatch via WebSocket. The server reconciles state with transactional PostgreSQL and broadcasts diffs...",
      score: "9.2",
      critique:
        "Strong breakdown of optimistic boundaries, CRDT conflict reconciliation, and edge fallback strategies. Demonstrates senior architectural depth.",
    },
    behavioral: {
      role: "Engineering Lead (Behavioral STAR)",
      type: "Behavioral Conflict & Execution",
      question:
        "Tell me about a high-stakes project launch where key dependencies slipped. How did you realign stakeholders and deliver on schedule?",
      answerDuration: "55s recorded",
      transcription:
        "When our payment gateway SDK delayed our Q3 rollout by two weeks, I called an emergency triage with product leads, descoped non-critical analytics, and unblocked the critical checkout path, delivering 4 days ahead of our revised cutoff...",
      score: "8.9",
      critique:
        "Clear Situation, quantified Actions, and measurable Result. Effectively highlights decisive leadership and pragmatic trade-offs under pressure.",
      star: { S: 9, T: 9, A: 9, R: 8 },
    },
  };

  const current = previewData[activeTab];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32 bg-white dark:bg-[#0B0914] transition-colors">
      {/* Subtle Background Glow Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] dark:bg-brand-primary/15" />
        <div className="absolute top-[20%] right-[10%] h-[420px] w-[420px] rounded-full bg-brand-secondary/15 blur-[130px] dark:bg-brand-secondary/10" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Value Prop, CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Main Headline */}
            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-dark dark:text-white leading-[1.12]"
            >
              Master Your Next Interview With{" "}
              <span className="bg-gradient-to-r from-brand-primary via-[#8B5CF6] to-brand-secondary bg-clip-text text-transparent">
                AI-Powered Precision.
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-brand-muted dark:text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Practice realistic technical and behavioral interviews. Improve your answers
              with personalized AI feedback and build confidence before your next interview.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-full bg-brand-primary hover:bg-brand-primaryHover text-white text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 rounded-full border-border bg-white dark:bg-white/5 hover:bg-brand-lavender dark:hover:bg-white/10 text-brand-dark dark:text-white text-base font-medium transition-all"
                >
                  <Play className="mr-2 h-4 w-4 fill-brand-primary text-brand-primary" />
                  See How It Works
                </Button>
              </a>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-brand-muted dark:text-neutral-400 pt-3"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Sub-Second Voice Transcription
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-brand-primary" />
                STAR Framework Scoring
              </span>
            </motion.div>
          </div>

          {/* Right Column: High-Fidelity Interactive Interview Preview */}
          <div className="lg:col-span-6 relative">
            {/* Main Interactive Card */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white/90 dark:bg-[#141124]/90 p-5 sm:p-7 shadow-xl shadow-brand-primary/5 backdrop-blur-xl transition-all"
            >
              {/* Header with Switcher Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted dark:text-neutral-400">
                    Live Session Simulator
                  </span>
                </div>
                <div className="inline-flex rounded-lg bg-brand-lavender dark:bg-white/5 p-1 border border-border/50 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab("technical")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeTab === "technical"
                        ? "bg-white dark:bg-brand-primary text-brand-dark dark:text-white shadow-sm font-semibold"
                        : "text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white"
                    }`}
                  >
                    Technical
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("behavioral")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      activeTab === "behavioral"
                        ? "bg-white dark:bg-brand-primary text-brand-dark dark:text-white shadow-sm font-semibold"
                        : "text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white"
                    }`}
                  >
                    Behavioral STAR
                  </button>
                </div>
              </div>

              {/* Question Box */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center rounded-md bg-brand-primary/10 text-brand-primary px-2 py-0.5 text-[11px] font-semibold">
                      {current.type}
                    </span>
                    <span className="text-[11px] text-brand-muted dark:text-neutral-400">
                      {current.role}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-brand-dark dark:text-white leading-snug">
                    "{current.question}"
                  </h3>
                </div>

                {/* Spoken Answer & Active Audio Waveform */}
                <div className="rounded-xl bg-brand-lavender/70 dark:bg-white/5 p-3.5 border border-[#E8E8F2] dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark dark:text-white">
                      <Mic className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
                      <span>Verbal Response Transcribed</span>
                    </div>
                    <span className="text-[11px] font-medium text-brand-muted dark:text-neutral-400">
                      {current.answerDuration}
                    </span>
                  </div>

                  {/* Audio Waveform visualization */}
                  <div className="py-1">
                    <AudioWaveform barCount={28} barColor="bg-brand-primary" />
                  </div>

                  <p className="text-xs text-brand-muted dark:text-neutral-300 italic leading-relaxed">
                    "{current.transcription}"
                  </p>
                </div>

                {/* AI Instant Feedback & Scoring Card */}
                <div className="rounded-xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-brand-secondary/5 to-transparent p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-brand-dark dark:text-white">
                        Instant AI Evaluation
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      <Award className="h-3 w-3" />
                      Score {current.score} / 10
                    </span>
                  </div>

                  {/* Optional STAR breakdown tags for behavioral */}
                  {current.star && (
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                      <div className="rounded bg-white/70 dark:bg-white/10 py-1 px-1 border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-brand-muted dark:text-neutral-400">Situation</span>
                        <span className="text-xs font-bold text-brand-primary">{current.star.S}/10</span>
                      </div>
                      <div className="rounded bg-white/70 dark:bg-white/10 py-1 px-1 border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-brand-muted dark:text-neutral-400">Task</span>
                        <span className="text-xs font-bold text-brand-primary">{current.star.T}/10</span>
                      </div>
                      <div className="rounded bg-white/70 dark:bg-white/10 py-1 px-1 border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-brand-muted dark:text-neutral-400">Action</span>
                        <span className="text-xs font-bold text-brand-primary">{current.star.A}/10</span>
                      </div>
                      <div className="rounded bg-white/70 dark:bg-white/10 py-1 px-1 border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-brand-muted dark:text-neutral-400">Result</span>
                        <span className="text-xs font-bold text-brand-primary">{current.star.R}/10</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-brand-muted dark:text-neutral-300 leading-relaxed">
                    {current.critique}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

