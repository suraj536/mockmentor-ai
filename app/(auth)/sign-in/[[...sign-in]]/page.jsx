import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import AuthShowcase from "@/components/auth/AuthShowcase";
import { Sparkles, ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Sign In – MockMentor AI",
  description: "Sign in to MockMentor AI to access your AI mock interviews, performance analytics, and personalized coaching.",
};

export default async function SignInPage() {
  // Preserve existing Clerk authentication check and dashboard redirect
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0914] text-brand-dark dark:text-white transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* LEFT PANEL – Branding and AI Product Experience (Desktop) */}
        <section className="hidden lg:block lg:col-span-6 xl:col-span-6 h-full">
          <AuthShowcase />
        </section>

        {/* RIGHT PANEL – Authentication with Clerk */}
        <main className="col-span-1 lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen">
          {/* Top Bar: Mobile Brand, Back link, and Theme Toggle */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            {/* Mobile-only logo */}
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-brand-dark dark:text-white">
                MockMentor <span className="text-brand-primary">AI</span>
              </span>
            </Link>

            {/* Desktop Back link */}
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>

          {/* Centered Authentication Form */}
          <div className="w-full max-w-md mx-auto my-auto py-8">
            <div className="mb-6 text-center lg:text-left space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white">
                Welcome Back
              </h2>
              <p className="text-sm text-brand-muted dark:text-neutral-400">
                Sign in to continue your interview preparation and track your progress.
              </p>
            </div>

            {/* Clerk Authentication Component with Custom Appearance */}
            <div className="w-full">
              <SignIn
                appearance={{
                  variables: {
                    colorPrimary: "#7657F6",
                    borderRadius: "0.875rem",
                    fontFamily: "inherit",
                  },
                  elements: {
                    rootBox: "w-full",
                    card: "w-full rounded-2xl sm:rounded-3xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-[#131124] shadow-xl shadow-brand-primary/5 p-6 sm:p-8 transition-colors",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "rounded-xl border border-[#E8E8F2] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-brand-lavender dark:hover:bg-white/10 text-sm font-semibold text-brand-dark dark:text-white transition-all h-11 shadow-sm",
                    socialButtonsBlockButtonText:
                      "font-semibold text-sm text-brand-dark dark:text-white",
                    dividerLine: "bg-[#E8E8F2] dark:bg-white/10",
                    dividerText:
                      "text-xs uppercase tracking-wider font-semibold text-brand-muted dark:text-neutral-500",
                    formFieldLabel:
                      "text-xs font-bold uppercase tracking-wider text-brand-dark dark:text-neutral-300 mb-1.5",
                    formFieldInput:
                      "rounded-xl border border-[#E8E8F2] dark:border-white/10 bg-brand-lavender/50 dark:bg-white/5 h-11 px-3.5 text-sm text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all",
                    formButtonPrimary:
                      "rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold text-sm h-11 shadow-md hover:shadow-lg transition-all duration-200",
                    formFieldAction:
                      "text-xs font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors",
                    footerActionLink:
                      "font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors",
                    footerActionText:
                      "text-xs text-brand-muted dark:text-neutral-400",
                    identityPreviewText:
                      "font-medium text-brand-dark dark:text-white",
                    identityPreviewEditButtonIcon: "text-brand-primary",
                    formFieldSuccessText: "text-xs text-emerald-500 font-medium",
                    formFieldErrorText: "text-xs text-rose-500 font-medium",
                    alertText: "text-xs text-rose-500 font-medium",
                  },
                }}
              />
            </div>
          </div>

          {/* Bottom Security & Legal Note */}
          <div className="w-full max-w-md mx-auto pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-muted dark:text-neutral-400 text-center sm:text-left">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secured with Clerk Authentication
            </span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-brand-dark dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-brand-dark dark:hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
