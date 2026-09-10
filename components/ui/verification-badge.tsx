"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerificationBadgeProps {
  level?: string | number;
  className?: string;
  source?: string;
  variant?: "solid" | "outline" | "compact";
}

/**
 * Official Sovereign Verification Badge
 * Authority: MoSPI Official Statistics & Karmayogi Bharat Integrated Competency Engine
 * Style: Deep navy background with Ashoka-blue/slate border, subtle metallic sheen on hover,
 * Lucide ShieldCheck icon, and sovereign validation stamp.
 */
export function VerificationBadge({
  level = "Level 4",
  className,
  source = "Karmayogi Bharat Integrated",
  variant = "solid",
}: VerificationBadgeProps) {
  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-md border border-sky-800/60 bg-[#0F172A] px-2.5 py-1 text-slate-100 shadow-sm transition-all duration-300 hover:border-sky-500/80 hover:shadow-[0_0_12px_rgba(2,132,199,0.25)]",
        className
      )}
      title="Official Sovereign Competency Verification"
    >
      {/* Subtle metallic sheen sweep on hover */}
      <div
        className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:translate-x-full"
        style={{ transitionDuration: "0.8s" }}
        aria-hidden="true"
      />

      {/* Sovereign Emblem Shield */}
      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-sky-500/20 text-sky-400 border border-sky-400/40">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      </div>

      {/* Official Text */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide">
        <span className="font-semibold text-white">FRAC {level} Validated</span>
        <span className="text-slate-500">·</span>
        <span className="text-sky-300/90 font-normal">{source}</span>
      </div>
    </div>
  );
}

// Backwards compatibility alias
export const SovereignVerificationTag = VerificationBadge;
