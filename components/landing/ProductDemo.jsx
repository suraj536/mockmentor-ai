"use client";

import React, { useState } from "react";
import {
  Volume2,
  Mic,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  ChevronRight,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionReveal from "./ui/SectionReveal";
import AudioWaveform from "./ui/AudioWaveform";

export default function ProductDemo() {
  const [currentStep, setCurrentStep] = useState(0); // 0: Question, 1: Record, 2: Feedback

  const stepsMeta = [
    { title: "Question Prompt", subtitle: "Dynamic Gemini Formulation" },
    { title: "Voice Recording", subtitle: "Speech Audio & Transcription" },
    { title: "AI Feedback", subtitle: "STAR Rubric & Scoring" },
  ];

  return (
    <section id="demo" className="py-20 sm:py-28 bg-white dark:bg-[#0B0914] transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-lavender dark:bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white">
            Experience the MockMentor AI Engine
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted dark:text-neutral-400">
            Step through an interview question from prompt generation to instant audio critique.
          </p>
        </SectionReveal>

        {/* Demo Container */}
        <SectionReveal className="max-w-4xl mx-auto" delay={0.1}>
          <div className="rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#121021] shadow-xl overflow-hidden">
            {/* Top Toolbar / Tab Switcher */}
            <div className="border-b border-[#E8E8F2] dark:border-white/10 bg-brand-lavender/50 dark:bg-white/5 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-medium text-brand-muted dark:text-neutral-400 pl-2">
                    MockMentor AI • Interview Session Preview
                  </span>
                </div>

                {/* Step Pills */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-black/30 p-1 rounded-xl border border-border/50 text-xs">
                  {stepsMeta.map((s, idx) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                        currentStep === idx
                          ? "bg-brand-primary text-white shadow-sm"
                          : "text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white"
                      }`}
                    >
                      {idx + 1}. {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* STAGE 0: Question Prompt */}
              {currentStep === 0 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md">
                      Question 1 of 5
                    </span>
                    <span className="text-xs font-semibold text-brand-muted dark:text-neutral-400">
                      Technical Architecture (Staff Level)
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-brand-lavender/30 dark:bg-white/5 p-5 space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-white leading-snug">
                      "Can you explain how you would design an idempotent payment processing pipeline that guarantees exactly-once billing during transient network failures?"
                    </h3>
                    <div className="flex items-center gap-3 pt-2 text-xs text-brand-muted dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1.5 bg-white dark:bg-black/40 px-2.5 py-1 rounded-md border border-border/40">
                        <Volume2 className="h-3.5 w-3.5 text-brand-primary" /> Audio Prompter Ready
                      </span>
                      <span>Target Duration: 45–60 seconds</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-border p-4 text-xs text-brand-muted dark:text-neutral-400 flex items-center justify-between">
                    <span>Ready to answer? Activate your microphone and speak clearly.</span>
                    <Button
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="bg-brand-primary hover:bg-brand-primaryHover text-white gap-1.5 rounded-lg"
                    >
                      Simulate Speech <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 1: Voice Recording */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      Live Audio Recording
                    </span>
                    <span className="text-xs font-semibold text-brand-muted dark:text-neutral-400">
                      Recording: 00:38 / 01:00
                    </span>
                  </div>

                  {/* Audio Waveform Box */}
                  <div className="rounded-2xl border border-brand-primary/20 bg-brand-lavender/40 dark:bg-white/5 p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-dark dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Mic className="h-4 w-4 text-brand-primary animate-pulse" />
                        Microphone Input: Active
                      </span>
                      <span className="text-emerald-500">Transcribing Speech in Real Time</span>
                    </div>

                    <div className="py-2 flex justify-center">
                      <AudioWaveform barCount={36} barColor="bg-brand-primary" />
                    </div>

                    <div className="rounded-xl bg-white dark:bg-black/40 p-4 border border-border/60 text-xs sm:text-sm text-brand-dark dark:text-neutral-200 leading-relaxed italic">
                      "To ensure exactly-once semantics, each client request generates a deterministic UUID idempotency key stored in Redis with a short TTL before hitting Postgres. On a retry, we check the idempotency table: if already processing, we return a 409 status; if completed, we return the cached ledger response without charging twice..."
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                      className="rounded-lg gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Question
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="bg-brand-primary hover:bg-brand-primaryHover text-white gap-1.5 rounded-lg"
                    >
                      Complete & Evaluate <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 2: AI Evaluation */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Evaluation Complete
                    </span>
                    <span className="text-xs font-bold text-brand-primary">
                      Generated in 380ms
                    </span>
                  </div>

                  {/* Rating Header */}
                  <div className="rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-brand-secondary/5 to-transparent p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-brand-muted dark:text-neutral-400">
                          Performance Score
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-brand-dark dark:text-white">9.1</span>
                          <span className="text-sm font-semibold text-brand-muted">/ 10</span>
                          <span className="ml-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Exceptional Answer
                          </span>
                        </div>
                      </div>

                      {/* STAR Framework badges */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white dark:bg-black/30 p-2 rounded-lg border border-border/50">
                          <span className="text-[10px] block font-bold text-brand-muted">S</span>
                          <span className="font-bold text-brand-primary">9/10</span>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-2 rounded-lg border border-border/50">
                          <span className="text-[10px] block font-bold text-brand-muted">T</span>
                          <span className="font-bold text-brand-primary">9/10</span>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-2 rounded-lg border border-border/50">
                          <span className="text-[10px] block font-bold text-brand-muted">A</span>
                          <span className="font-bold text-brand-primary">10/10</span>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-2 rounded-lg border border-border/50">
                          <span className="text-[10px] block font-bold text-brand-muted">R</span>
                          <span className="font-bold text-brand-primary">8.5/10</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-3 space-y-2">
                      <p className="text-xs sm:text-sm text-brand-dark dark:text-neutral-200 leading-relaxed font-medium">
                        "Outstanding breakdown. You immediately identified idempotency keys, distributed locks, and two-phase database verification. Excellent handling of transient network retries."
                      </p>
                      <p className="text-xs text-brand-muted dark:text-neutral-400">
                        <strong className="text-brand-dark dark:text-white">Area to elevate:</strong> Mention how you handle stale lock expiry if a worker crashes before persisting the ledger record.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="rounded-lg gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Audio
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                      variant="secondary"
                      className="rounded-lg gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restart Demo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

