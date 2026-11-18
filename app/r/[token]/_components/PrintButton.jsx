"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PrintButton({ title = "Report" }) {
  const handlePrint = () => {
    if (typeof window === "undefined") return;
    const originalTitle = document.title;
    document.title = title;

    const cleanup = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 text-xs sm:text-sm print:hidden"
      aria-label="Download or print report as PDF"
    >
      <Download className="h-4 w-4" />
      <span>Print / Save as PDF</span>
    </Button>
  );
}

