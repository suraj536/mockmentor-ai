"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "./DashboardSidebar";
import { cn } from "@/lib/utils";

export default function DashboardMobileNav({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0E0C1B] border-r border-[#E8E8F2] dark:border-white/10 shadow-2xl flex flex-col justify-between p-5 z-50"
          >
            {/* Top Branding & Close Button */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#E8E8F2] dark:border-white/10">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-base font-bold text-brand-dark dark:text-white">
                    MockMentor{" "}
                    <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent font-extrabold">
                      AI
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  aria-label="Close navigation drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="py-4 space-y-1.5" aria-label="Mobile Navigation">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary font-semibold"
                          : "text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white hover:bg-brand-lavender dark:hover:bg-white/5"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-brand-primary" : "text-brand-muted")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom: Back to Home link */}
            <div className="pt-4 border-t border-[#E8E8F2] dark:border-white/10">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-brand-muted dark:text-neutral-400 hover:text-brand-dark dark:hover:text-white hover:bg-brand-lavender dark:hover:bg-white/5 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

