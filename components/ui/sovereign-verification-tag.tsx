"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SovereignVerificationTagProps {
  level?: string | number;
  className?: string;
  source?: string;
}

export function SovereignVerificationTag({
  level = "Level 4",
  className,
  source = "Karmayogi Bharat API",
}: SovereignVerificationTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900 px-2.5 py-1 text-slate-100 shadow-sm ring-1 ring-white/10 dark:bg-slate-950",
        className
      )}
      title="Sovereign Competency Audit Record"
    >
      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-sky-500/20 text-sky-400 border border-sky-400/40">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide">
        <span className="font-semibold text-white">FRAC {level} Validated</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-300 font-normal">{source}</span>
      </div>
    </div>
  );
}
