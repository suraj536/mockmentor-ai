import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/ModeToggle";
import Contact from "./_components/Contact";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Mic,
  CheckCircle2,
  Building2,
  SunMoon,
  History,
} from "lucide-react";

export const metadata = {
  title: "MockMentor AI",
  description: "Ace your next interview with AI-powered mock interviews and instant feedback",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              MockMentor <span className="font-extrabold text-primary">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-4 py-1.5 text-xs sm:text-sm font-medium text-foreground shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Gemini 2.5 Flash</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Master Your Next Interview with AI-Powered Precision
            </h1>

            {/* Subtext */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Practice realistic technical and behavioral interviews tailored to your exact role and experience level. Speak your answers naturally and get instant, structured feedback.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-6">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Example Preview Card */}
            <div className="mt-12 sm:mt-16 mx-auto max-w-3xl text-left">
              <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Example Preview
                    </span>
                    <span className="text-xs text-muted-foreground">Sample Scenario</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Role: Full Stack Engineer (3 YOE)
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Question 1 of 5
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      "How do you manage state across deeply nested components in modern Next.js, and when would you choose Server Components over Client state?"
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3.5 border border-border/50 text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-1.5 text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Mic className="h-3.5 w-3.5 text-primary" /> Spoken Answer (Transcribed)
                      </span>
                      <span className="text-[11px]">Audio duration: 38s</span>
                    </div>
                    <p className="text-foreground italic">
                      "In the Next.js App Router, I leverage React Server Components to fetch and keep state on the server wherever possible. For client-side interactive widgets, React Context or lightweight stores handle shared UI state while avoiding unnecessary re-renders..."
                    </p>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI Feedback Summary
                      </span>
                      <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        Rating: 8.5 / 10
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Clear explanation of server vs. client state boundaries. Strong response with relevant architectural trade-offs mentioned.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
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

        {/* How It Works Section */}
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

        {/* Contact Section */}
        <section id="contact" className="py-16 sm:py-24 border-t border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Contact />
          </div>
        </section>
      </main>

      {/* Footer */}
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
