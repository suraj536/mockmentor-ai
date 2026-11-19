"use client";

import React from "react";
import { Sliders, Mic, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import SectionReveal from "./ui/SectionReveal";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Set Your Role Details",
      description:
        "Enter your target job title, job description, and years of experience. Gemini 2.5 Flash crafts relevant interview questions based on your profile.",
      icon: Sliders,
      tag: "Dynamic Prompting",
      detail: "Custom Tech Stack & Seniority Matching",
    },
    {
      step: "02",
      title: "Record Your Answers",
      description:
        "Read each question and speak your answer aloud using your microphone, simulating the pressure and pacing of an actual verbal interview.",
      icon: Mic,
      tag: "Voice-First Simulator",
      detail: "Real-time speech-to-text transcription",
    },
    {
      step: "03",
      title: "Get Actionable Feedback",
      description:
        "Receive ratings out of 10, compare your transcribed answer with ideal response benchmarks, and discover key areas for improvement.",
      icon: Sparkles,
      tag: "STAR-Level Critique",
      detail: "Actionable rubric & constructive coaching",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 border-t border-[#E8E8F2] dark:border-white/10 bg-brand-lavender/40 dark:bg-[#0E0C1B]/40 transition-colors"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionReveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Step-By-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-white mt-1.5">
            How MockMentor AI Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted dark:text-neutral-400">
            Three straightforward steps from preparation to personalized feedback.
          </p>
        </SectionReveal>

        {/* Desktop Connected Timeline Cards */}
        <div className="relative">
          {/* Connecting gradient line behind cards on desktop */}
          <div
            className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-0.5 -translate-y-12 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/40 to-brand-primary/20 -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <SectionReveal key={item.step} delay={idx * 0.15}>
                  <div className="group relative h-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] p-7 shadow-sm hover:shadow-xl hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between">
                    {/* Top Row: Number & Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-3xl font-black text-brand-primary/20 dark:text-white/10 font-mono tracking-tight group-hover:text-brand-primary/40 transition-colors">
                          {item.step}
                        </span>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="inline-block rounded-md bg-brand-lavender dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary mb-3">
                        {item.tag}
                      </div>

                      <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2.5">
                        {item.title}
                      </h3>

                      <p className="text-sm text-brand-muted dark:text-neutral-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Feature Pill */}
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-semibold text-brand-dark dark:text-neutral-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{item.detail}</span>
                    </div>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

