import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#0B0914] py-12 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/50 text-center md:text-left">
          {/* Brand & Tagline */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-dark dark:text-white">
                MockMentor{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-extrabold">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-brand-muted dark:text-neutral-400 max-w-md">
              AI-powered precision interview coaching with real-time audio capture, STAR rubric grading, and role-tailored simulations.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-brand-muted dark:text-neutral-400">
            <a href="#features" className="hover:text-brand-dark dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-dark dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-brand-dark dark:hover:text-white transition-colors">
              Demo
            </a>
            <a href="#contact" className="hover:text-brand-dark dark:hover:text-white transition-colors">
              Contact
            </a>
            <Link
              href="/dashboard"
              className="text-brand-primary hover:text-brand-primaryHover font-semibold transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Bottom Copyright & Tech Tag */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted dark:text-neutral-500 text-center sm:text-left">
          <p>© 2026 MockMentor AI. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Voice-First Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

