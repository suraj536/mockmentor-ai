"use client";

import React, { createContext, useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";

// Preserved WebCamContext for interview preparation routes
export const WebCamContext = createContext();

export default function DashboardLayout({ children }) {
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Restore sidebar preference from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("mockmentor_sidebar_collapsed");
        if (stored === "1") {
          setIsCollapsed(true);
        }
      }
    } catch (_) {}
  }, []);

  return (
    <WebCamContext.Provider value={{ webCamEnabled, setWebCamEnabled }}>
      <div className="min-h-screen bg-background text-foreground flex antialiased">
        {/* Desktop Collapsible Sidebar */}
        <DashboardSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Mobile Navigation Drawer */}
        <DashboardMobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
          <DashboardHeader
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
            {children}
          </main>
        </div>
      </div>
    </WebCamContext.Provider>
  );
}
