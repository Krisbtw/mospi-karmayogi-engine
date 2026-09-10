"use client";

import React from "react";
import { Check, ArrowRight, CircleDot, Award, BookOpen, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyStep {
  id: string;
  label: string;
  sublabel: string;
  status: "completed" | "current" | "upcoming";
}

interface JourneyStepperProps {
  steps: JourneyStep[];
  className?: string;
}

export function JourneyStepper({ steps, className }: JourneyStepperProps) {
  const getIcon = (step: JourneyStep, index: number) => {
    if (step.status === "completed") {
      return <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
    }
    if (step.status === "current") {
      return <CircleDot className="h-3 w-3 text-primary animate-pulse" aria-hidden="true" />;
    }
    if (index === 0) return <AlertTriangle className="h-3 w-3 text-amber-500" aria-hidden="true" />;
    if (index === steps.length - 1) return <Award className="h-3 w-3 text-slate-400" aria-hidden="true" />;
    return <BookOpen className="h-3 w-3 text-slate-400" aria-hidden="true" />;
  };

  return (
    <div className={cn("w-full py-2.5", className)}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-mono transition-all duration-300",
                    isCompleted
                      ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,160,165,0.25)] ring-2 ring-primary/20"
                      : "border-border bg-slate-100 text-fg-muted dark:bg-slate-800/80"
                  )}
                >
                  {getIcon(step, idx)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-[11px] font-medium leading-tight truncate",
                      isCurrent ? "text-primary font-semibold" : isCompleted ? "text-fg" : "text-fg-muted"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-fg-muted truncate">{step.sublabel}</p>
                </div>
              </div>

              {!isLast && (
                <div className="hidden sm:flex items-center px-1 text-slate-300 dark:text-slate-700 shrink-0">
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
