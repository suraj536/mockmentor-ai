"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/progress",
    label: "Progress",
    icon: TrendingUp,
    exact: false,
  },
  {
    href: "/dashboard/question",
    label: "Questions",
    icon: HelpCircle,
    exact: false,
  },
  {
    href: "/dashboard/howit",
    label: "How it works?",
    icon: Sparkles,
    exact: false,
  },
];

export default function DashboardSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mockmentor_sidebar_collapsed", next ? "1" : "0");
      }
    } catch (_) {}
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col justify-between shrink-0 sticky top-0 h-screen border-r border-[#E8E8F2] dark:border-white/10 bg-[#F7F7FC] dark:bg-[#0E0C1B] z-30 transition-[width] duration-300 print:hidden select-none",
        isCollapsed ? "w-[72px]" : "w-60"
      )}
      aria-label="Dashboard Navigation Sidebar"
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-[#E8E8F2] dark:border-white/10 overflow-hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg group"
            title="MockMentor AI Dashboard"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>

            {!isCollapsed && (
              <motion.span
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -6 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold tracking-tight text-brand-dark dark:text-white whitespace-nowrap overflow-hidden text-ellipsis"
              >
                MockMentor{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-extrabold">
                  AI
                </span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Dashboard Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary font-semibold shadow-sm"
                    : "text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
                  isCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                )}
                title={isCollapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-brand-primary" : "text-brand-muted group-hover:text-brand-dark dark:group-hover:text-white"
                  )}
                />

                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                )}

                {/* Left Active Accent Bar */}
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Back to Home & Collapse Toggle */}
      <div className="p-3 border-t border-[#E8E8F2] dark:border-white/10 space-y-1">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all group",
            isCollapsed && "justify-center px-0 h-9 w-9 mx-auto"
          )}
          title={isCollapsed ? "Back to Homepage" : undefined}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Back to Home
            </span>
          )}
        </Link>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
            isCollapsed && "justify-center px-0 h-9 w-9 mx-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Collapse Sidebar
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

