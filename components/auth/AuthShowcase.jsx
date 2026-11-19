"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  Mic,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AudioWaveform from "@/components/landing/ui/AudioWaveform";

export default function AuthShowcase() {
  const shouldReduceMotion = useReducedMotion();

  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Interview Questions",
      description: "Tailored dynamically to your target role, tech stack, and years of experience.",
    },
    {
      icon: Mic,
      title: "Real-Time Answer Evaluation",
      description: "Instant verbal transcription and constructive coaching on your spoken answers.",
    },
    {
      icon: BarChart3,
      title: "Personalized Performance Insights",
      description: "Objective 4-part STAR framework scoring with clear improvement benchmarks.",
    },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-lavender/70 dark:bg-[#0E0C1B] p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-r border-[#E8E8F2] dark:border-white/10 transition-colors">
      {/* Background Radial Glow Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-brand-primary/10 blur-[100px] dark:bg-brand-primary/15" />
        <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-brand-secondary/15 blur-[100px] dark:bg-brand-secondary/10" />
      </div>

      {/* Top Branding */}
      <div>
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-dark dark:text-white">
            MockMentor{" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-extrabold">
              AI
            </span>
          </span>
        </Link>
      </div>

      {/* Middle Content: Heading, Description & Benefits */}
      <div className="my-8 lg:my-auto max-w-xl space-y-7">
        <div className="space-y-4">
          <motion.h1
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-dark dark:text-white leading-[1.14]"
          >
            Practice with Confidence.{" "}
            <span className="bg-gradient-to-r from-brand-primary via-[#8B5CF6] to-brand-secondary bg-clip-text text-transparent">
              Perform with Excellence.
            </span>
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-brand-muted dark:text-neutral-300 leading-relaxed"
          >
            Join thousands of developers and professionals sharpening their interview skills with
            real-time verbal simulations, STAR rubric grading, and instant AI coaching.
          </motion.p>
        </div>

        {/* 3 Product Benefits */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3.5"
        >
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E8E8F2] dark:border-white/10 p-3.5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-dark dark:text-white">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-brand-muted dark:text-neutral-400 leading-relaxed mt-0.5">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Product Visuals: Compact Interview Preview Card with Waveform */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.98 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative rounded-2xl border border-[#E8E8F2] dark:border-white/10 bg-white/95 dark:bg-[#131124]/95 p-4 sm:p-5 shadow-lg shadow-brand-primary/5 backdrop-blur-md space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md text-[11px]">
              Technical Question Preview
            </span>
            <span className="text-[11px] text-brand-muted dark:text-neutral-400">
              Staff Full Stack Engineer
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-brand-dark dark:text-white leading-snug">
            "How do you design a real-time collaborative workspace with optimistic updates and offline resilience?"
          </p>

          {/* Audio Waveform Row */}
          <div className="rounded-xl bg-brand-lavender/60 dark:bg-white/5 p-2.5 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-brand-dark dark:text-white">
              <span className="flex items-center gap-1.5">
                <Mic className="h-3 w-3 text-brand-primary animate-pulse" /> Verbal Response Active
              </span>
              <span className="text-emerald-500 font-bold">Score 9.2 / 10</span>
            </div>
            <AudioWaveform barCount={24} barColor="bg-brand-primary" className="h-6" />
          </div>

          {/* Score Tags */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> High Architectural Clarity
            </span>
            <span className="text-brand-muted dark:text-neutral-400">
              STAR Rubric Validated
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Trust Line */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-brand-muted dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Secure Enterprise Authentication
        </span>
        <span>© 2026 MockMentor AI</span>
      </div>
    </div>
  );
}

