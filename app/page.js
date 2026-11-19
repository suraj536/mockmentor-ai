import React from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Contact from "./_components/Contact";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Mic,
  CheckCircle2,
  Building2,
  SunMoon,
  History,
} from "lucide-react";

export const metadata = {
  title: "MockMentor AI – Precision AI Interview Preparation",
  description:
    "Master your next interview with AI-powered precision. Practice realistic technical and behavioral interviews with real-time voice capture, STAR rubric grading, and personalized feedback.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand-primary/20 selection:text-brand-primary scroll-smooth">
      {/* 1. New Modern Sticky Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. New 2027-Style Hero Section with Interactive Preview */}
        <HeroSection />

        {/* Existing Features Section (Preserved for review) */}
        <section id="features" className="py-16 sm:py-24 border-t border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built for Serious Interview Preparation
              </h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                Practice, evaluate, and refine your interview answers before facing real hiring panels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Role-Tailored Questions</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    Dynamic questions generated for your exact job title, tech stack, job description, and years of experience using Gemini 2.5 Flash.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Mic className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Voice & Audio Recording</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    Speak your answers aloud into your microphone with automated transcription to replicate real verbal interview conditions.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Instant Scoring & Critique</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    Receive clear ratings, constructive feedback on areas for improvement, and ideal answers to learn from after every question.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Company-Focused Questions</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    Generate question banks targeting specific companies and question categories to prepare for company-specific interview rounds.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <SunMoon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Dark & Light Themes</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    A distraction-free, accessible design with full dark and light mode support for comfortable daytime or late-night practice.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/60 bg-card hover:border-border transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <History className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">Session History</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    Review all your previous interviews, recorded responses, and feedback summaries anytime right from your dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Existing How It Works Section (Preserved for review) */}
        <section id="how-it-works" className="py-16 sm:py-24 border-t border-border/40">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How MockMentor AI Works
              </h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                Three straightforward steps from preparation to personalized feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Set Your Role Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter your target job title, job description, and years of experience. Gemini 2.5 Flash crafts relevant interview questions based on your profile.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Record Your Answers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Read each question and speak your answer aloud using your microphone, simulating the pressure and pacing of an actual verbal interview.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Get Actionable Feedback</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receive ratings out of 10, compare your transcribed answer with ideal response benchmarks, and discover key areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Contact Section (Preserved for review) */}
        <section id="contact" className="py-16 sm:py-24 border-t border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Contact />
          </div>
        </section>
      </main>

      {/* Existing Footer (Preserved for review) */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            © 2026 MockMentor AI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
