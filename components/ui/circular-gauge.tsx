"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularGaugeProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function CircularGauge({
  value,
  size = 46,
  strokeWidth = 4,
  label = "FRAC Readiness",
  className,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  // Determine color theme based on readiness rate
  const isHigh = value >= 75;
  const isMed = value >= 50 && value < 75;
  const strokeColor = isHigh ? "#059669" : isMed ? "#0284C7" : "#D97706";

  return (
    <div className={cn("inline-flex items-center gap-2.5 rounded-lg border border-border/80 bg-surface/90 px-3 py-1.5 shadow-sm backdrop-blur-md", className)}>
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-200/80 dark:text-slate-800"
          />
          {/* Animated fill circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute font-mono text-[11px] font-bold text-fg">
          {Math.round(value)}%
        </span>
      </div>

      <div className="flex flex-col">
        <span className="font-mono text-[9px] uppercase tracking-wider text-fg-muted leading-tight">
          {label}
        </span>
        <span className="text-xs font-semibold text-fg leading-tight">
          {isHigh ? "Benchmark Met" : isMed ? "In Progress" : "Critical Deficit"}
        </span>
      </div>
    </div>
  );
}
