"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AudioWaveform({
  isPlaying = true,
  barCount = 24,
  className = "",
  barColor = "bg-brand-primary",
}) {
  const shouldReduceMotion = useReducedMotion();

  // Preset heights for natural voice audio patterns
  const heights = [
    25, 45, 75, 90, 60, 35, 70, 85, 100, 75, 50, 80, 95, 65, 40, 70, 85, 55, 30,
    60, 80, 95, 50, 30,
  ];

  return (
    <div
      className={`flex items-center gap-[3px] h-8 px-2 py-1 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const baseHeight = heights[i % heights.length];
        const targetHeight = Math.max(15, (baseHeight * 0.85).toFixed(0));

        if (shouldReduceMotion || !isPlaying) {
          return (
            <div
              key={i}
              className={`w-[3px] rounded-full ${barColor}`}
              style={{ height: `${baseHeight * 0.35 + 4}px` }}
            />
          );
        }

        return (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full ${barColor}`}
            initial={{ height: "4px" }}
            animate={{
              height: [
                `${Math.max(6, baseHeight * 0.25)}px`,
                `${Math.max(10, baseHeight * 0.9)}px`,
                `${Math.max(4, baseHeight * 0.15)}px`,
                `${Math.max(8, baseHeight * 0.7)}px`,
              ],
            }}
            transition={{
              duration: 1.1 + (i % 5) * 0.15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: (i * 0.04) % 0.6,
            }}
          />
        );
      })}
    </div>
  );
}

