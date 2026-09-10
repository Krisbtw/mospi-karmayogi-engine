"use client";

import React from "react";
import { Spotlight } from "./spotlight";
import { cn } from "@/lib/utils";

interface DashboardBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function DashboardBackground({
  children,
  className,
}: DashboardBackgroundProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-950 transition-colors",
        className
      )}
    >
      {/* 1. Directional Ambient Spotlights at Top */}
      <Spotlight
        id="spotlight-left"
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-80"
        fill="#38bdf8"
      />
      <Spotlight
        id="spotlight-right"
        className="top-10 left-full -translate-x-1/2 opacity-50"
        fill="#1e40af"
      />

      {/* 2. Statistical Blueprint Crosshairs SVG Pattern */}
      {/* Smoothly fades in over first 140px, stays fully visible throughout cards, then smoothly fades out at bottom */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0px, black 140px, black calc(100% - 320px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0px, black 140px, black calc(100% - 320px), transparent 100%)",
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Minor coordinate sub-grid */}
          <pattern
            id="blueprint-subgrid"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke="rgba(148, 163, 184, 0.05)"
              strokeWidth="1"
            />
          </pattern>

          {/* Major coordinate grid with precision crosshairs */}
          <pattern
            id="blueprint-grid"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            {/* Embedded minor sub-grid */}
            <rect width="64" height="64" fill="url(#blueprint-subgrid)" />

            {/* Major grid lines */}
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(148, 163, 184, 0.12)"
              strokeWidth="1"
            />

            {/* Precision Crosshairs (+) at intersection points */}
            <path
              d="M -5 0 L 5 0 M 0 -5 L 0 5"
              fill="none"
              stroke="rgba(56, 189, 248, 0.42)"
              strokeWidth="1.25"
            />

            {/* Coordinate center datum dot */}
            <circle cx="32" cy="32" r="1" fill="rgba(148, 163, 184, 0.22)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      </svg>

      {/* 3. Ambient Backlighting Blooms (Illuminates metrics, radar chart & courses) */}
      {/* Behind Top Telemetry strip */}
      <div
        className="pointer-events-none absolute top-36 left-1/4 -translate-x-1/2 h-[500px] w-[650px] rounded-full bg-sky-600/10 blur-[150px]"
        aria-hidden="true"
      />
      {/* Behind Competency Radar Card */}
      <div
        className="pointer-events-none absolute top-[620px] left-1/4 -translate-x-1/4 h-[550px] w-[650px] rounded-full bg-sky-500/10 blur-[160px]"
        aria-hidden="true"
      />
      {/* Behind iGOT Karmayogi Courses */}
      <div
        className="pointer-events-none absolute top-[700px] right-1/4 translate-x-1/4 h-[500px] w-[600px] rounded-full bg-blue-900/15 blur-[170px]"
        aria-hidden="true"
      />
      {/* Bottom Area Ambient Glow */}
      <div
        className="pointer-events-none absolute bottom-48 left-1/3 -translate-x-1/2 h-[420px] w-[600px] rounded-full bg-emerald-600/6 blur-[170px]"
        aria-hidden="true"
      />

      {/* 4. Dashboard Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
