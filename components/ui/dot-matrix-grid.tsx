"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DotMatrixGridProps {
  className?: string;
  dotSize?: number;
  gap?: number;
  color?: string;
  opacity?: number;
}

export function DotMatrixGrid({
  className,
  dotSize = 1.25,
  gap = 20,
  color = "#38bdf8",
  opacity = 0.18,
}: DotMatrixGridProps) {
  const patternId = "statistical-grid-pattern";

  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={color} />
        </pattern>
        {/* Radial vignette mask so the grid softly fades out toward the edges */}
        <radialGradient id="grid-fade" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity={opacity} />
          <stop offset="60%" stopColor="#fff" stopOpacity={opacity * 0.4} />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="fade-mask">
          <rect width="100%" height="100%" fill="url(#grid-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${patternId})`}
        mask="url(#fade-mask)"
      />
    </svg>
  );
}
