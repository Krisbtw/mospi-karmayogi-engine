"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularGaugeProps {
  value: number; // 0 - 100 percentage
  metCount?: number;
  totalCount?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function CircularGauge({
  value,
  metCount = 3,
  totalCount = 5,
  size = 52,
  strokeWidth = 4.5,
  label = "FRAC Readiness",
  className,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  // Sovereign color coding: High >= 70 (Emerald), Moderate 40-70 (Ashoka Blue), Critical < 40 (Amber)
  const isHigh = value >= 70;
  const isMed = value >= 40 && value < 70;
  const strokeColor = isHigh ? "#059669" : isMed ? "#0284C7" : "#D97706";
  const glowColor = isHigh ? "rgba(5, 150, 105, 0.25)" : isMed ? "rgba(2, 132, 199, 0.25)" : "rgba(217, 119, 6, 0.25)";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90",
        className
      )}
      style={{
        boxShadow: `0 2px 12px ${glowColor}`,
      }}
    >
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Animated Stroke Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute font-mono text-[12px] font-bold text-fg">
          {Math.round(value)}%
        </span>
      </div>

      <div className="flex flex-col">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-fg-muted leading-tight">
          {label}
        </span>
        <span className="mt-0.5 text-xs font-medium text-fg leading-tight">
          <strong className="text-primary font-semibold">{metCount} of {totalCount}</strong> Core Competencies at Target
        </span>
        <span className="text-[10px] text-fg-muted leading-tight mt-0.5">
          Cadre Benchmark Standard
        </span>
      </div>
    </div>
  );
}
