"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function FloatingCard({
  children,
  className = "",
  initialY = 0,
  floatDistance = 10,
  duration = 4,
  delay = 0,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ y: initialY, opacity: 0 }}
      animate={{
        y: [initialY, initialY - floatDistance, initialY],
        opacity: 1,
      }}
      transition={{
        y: {
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
        opacity: {
          duration: 0.6,
          delay: delay * 0.5,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

