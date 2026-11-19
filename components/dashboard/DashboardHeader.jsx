"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import { Menu, ChevronRight, Sparkles } from "lucide-react";

export default function DashboardHeader({ onOpenMobileNav }) {
  const pathname = usePathname();
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Determine breadcrumb label from current pathname
  const getBreadcrumbTitle = () => {
    if (!pathname) return "Dashboard";
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/dashboard/progress")) return "Progress Analytics";
    if (pathname.startsWith("/dashboard/question")) return "Question Bank";
    if (pathname.startsWith("/dashboard/howit")) return "How It Works";
    if (pathname.includes("/feedback")) return "Feedback Report";
    if (pathname.includes("/start")) return "Live Interview";
    if (pathname.startsWith("/dashboard/interview/")) return "Interview Setup";
    if (pathname.startsWith("/dashboard/pyq")) return "Previous Year Questions";
    return "Workspace";
  };

  const breadcrumb = getBreadcrumbTitle();

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-[#E8E8F2] dark:border-white/10 bg-white/80 dark:bg-[#0B0914]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors print:hidden">
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-background text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile brand icon when sidebar is hidden */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
        </Link>

        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-muted dark:text-neutral-400">
          <Link
            href="/dashboard"
            className="hover:text-brand-dark dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 text-brand-muted/60" />
          <span className="font-semibold text-brand-dark dark:text-white">
            {breadcrumb}
          </span>
        </nav>

        {/* Mobile compact title */}
        <span className="sm:hidden text-xs font-semibold text-brand-dark dark:text-white truncate max-w-[140px]">
          {breadcrumb}
        </span>
      </div>

      {/* Right Controls: Theme Toggle & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ModeToggle />

        <div className="flex items-center">
          {isUserButtonLoaded ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-brand-primary/20",
                },
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse border border-border/60" />
          )}
        </div>
      </div>
    </header>
  );
}

