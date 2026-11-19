import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  ClipboardList,
  Mic,
  BarChart3,
  Sparkles,
  ArrowRight,
  Share2,
  Flame,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "How It Works - MockMentor AI",
  description:
    "Learn how to prepare, practice, and improve your technical and behavioral interview performance with MockMentor AI.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      icon: ClipboardList,
      title: "Prepare Your Session",
      description:
        "Select Technical or Behavioral (STAR) mode. Provide your target job position and job description, or upload a resume to tailor the interview to your background. Choose from 9 supported languages.",
      chips: [
        "Technical",
        "Behavioral (STAR)",
        "Resume or Job Description",
        "9 Languages",
      ],
    },
    {
      step: "02",
      icon: Mic,
      title: "Practice the Interview",
      description:
        "Listen to spoken questions read aloud via speech synthesis, or toggle hands-free mode for automatic question progression. Record spoken answers with your microphone, and respond to adaptive follow-up probes.",
      chips: [
        "Voice Recording",
        "Hands-Free Mode",
        "Spoken Questions",
        "Follow-Up Probes",
      ],
    },
    {
      step: "03",
      icon: BarChart3,
      title: "Evaluate & Improve",
      description:
        "Review per-question ratings and structured feedback. Behavioral answers include Situation, Task, Action, and Result scoring. Get tailored coaching tips and start targeted practice on questions rated 6/10 or below.",
      chips: [
        "STAR Rubric",
        "Coaching Tips",
        "Practice Weak Answers",
        "Scored out of 10",
      ],
    },
  ];

  const highlights = [
    {
      icon: CheckCircle2,
      label: "Per-Question Feedback",
      value: "Scored out of 10",
      hint: "Targeted feedback and model answers",
    },
    {
      icon: TrendingUp,
      label: "Performance Tracking",
      value: "Score Trajectory",
      hint: "Progress charts across interview types",
    },
    {
      icon: Flame,
      label: "Consistency Goals",
      value: "Daily Streaks",
      hint: "Set weekly practice goals",
    },
    {
      icon: Share2,
      label: "Mentorship Sharing",
      value: "Public Reports",
      hint: "Secure read-only links for mentors",
    },
  ];

  return (
    <div className="space-y-10 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="How MockMentor AI Works"
        description="A structured three-step workflow to practice realistic technical and behavioral interviews with real-time AI evaluation."
        badge={
          <Badge variant="secondary" className="gap-1.5 font-medium">
            <Sparkles className="h-3 w-3 text-primary-text" />
            Getting Started
          </Badge>
        }
        actions={
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button size="sm" className="gap-2">
              Start an interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* 3 Step Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Three Steps to Interview Readiness
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            End-to-end AI interview cycle
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div>
                  {/* Step Top Bar: Pill & Icon */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-primary/10 text-primary-text border border-primary/20">
                      Step {item.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title & Body */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground mt-4">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="pt-4 border-t border-border/40 mt-5 flex flex-wrap gap-1.5">
                  {item.chips.map((chip) => (
                    <Badge
                      key={chip}
                      variant="outline"
                      className="text-[11px] font-normal"
                    >
                      {chip}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* "What You Get" Highlight Strip */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            What You Get
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Key capabilities included in every interview session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item) => (
            <StatCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
              hint={item.hint}
            />
          ))}
        </div>
      </section>

      {/* Primary CTA Strip */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Ready to test your skills?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Start a simulated session tailored to your target job position and receive instant AI feedback.
          </p>
        </div>
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto h-11 px-7 rounded-xl font-semibold gap-2">
            Start a mock interview
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
