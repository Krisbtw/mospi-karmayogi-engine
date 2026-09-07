"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { TrendingUp, Layers, AlertTriangle, ShieldCheck, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompetencyItem, Officer } from "@/lib/data-service";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 26,
    stiffness: 90,
  });
  const isInView = useInView(ref, { once: false, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const formatted = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)));
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, decimalPlaces, prefix, suffix]);

  return (
    <span
      className={cn("inline-block tabular-nums font-mono", className)}
      ref={ref}
    >
      {prefix}{value.toFixed(decimalPlaces)}{suffix}
    </span>
  );
}

interface MetricStripProps {
  officer: Officer;
  competencies: CompetencyItem[];
  completedCoursesCount?: number;
}

export function MetricStrip({
  officer,
  competencies,
  completedCoursesCount = 3,
}: MetricStripProps) {
  const total = competencies.length || 1;
  const met = competencies.filter((c) => c.current >= c.target).length;
  const coveragePercent = Math.round((met / total) * 100);

  const activeGaps = competencies.filter((c) => c.current < c.target);
  const totalGapScore = activeGaps.reduce((sum, c) => sum + (c.target - c.current), 0);
  const avgGap = activeGaps.length > 0 ? totalGapScore / activeGaps.length : 0;

  // Estimated learning hours mapped to this officer
  const estimatedHours = 38 + completedCoursesCount * 14;

  const metrics = [
    {
      id: "coverage",
      label: "Cadre FRAC Coverage",
      subLabel: `${met} of ${total} standards achieved`,
      value: coveragePercent,
      suffix: "%",
      decimalPlaces: 0,
      delta: "+14.2% MoM",
      deltaType: "positive" as const,
      icon: Award,
      color: "from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/30",
      accentBar: "bg-sky-500",
    },
    {
      id: "competencies",
      label: "Competencies Monitored",
      subLabel: `MoSPI FRAC Taxonomy · ${officer.cadreRank}`,
      value: competencies.length,
      decimalPlaces: 0,
      delta: "4 Core Domains",
      deltaType: "neutral" as const,
      icon: Layers,
      color: "from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30",
      accentBar: "bg-indigo-500",
    },
    {
      id: "deficit",
      label: "Avg. Skill Deficit",
      subLabel: `${activeGaps.length} identified cadre gaps`,
      value: avgGap,
      suffix: " Lvl",
      decimalPlaces: 1,
      delta: "-0.4 Lvl Reduction",
      deltaType: "positive" as const,
      icon: AlertTriangle,
      color: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30",
      accentBar: "bg-amber-500",
    },
    {
      id: "hours",
      label: "iGOT Training Velocity",
      subLabel: "Sunbird-verified learning credits",
      value: estimatedHours,
      suffix: " hrs",
      decimalPlaces: 0,
      delta: "Active Cadre Cohort",
      deltaType: "neutral" as const,
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30",
      accentBar: "bg-emerald-500",
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Executive Competency Telemetry · {officer.name} ({officer.cadreRank})
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
          <Sparkles className="h-3 w-3 text-sky-400" />
          Live FRAC Sync
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-4 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-slate-700 hover:shadow-sky-950/20"
            >
              {/* Subtle top accent bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity", item.accentBar)} />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                      <NumberTicker
                        value={item.value}
                        decimalPlaces={item.decimalPlaces}
                        suffix={item.suffix}
                        delay={0.05 * idx}
                      />
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-br transition-transform group-hover:scale-105",
                    item.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2.5 text-[11px]">
                <span className="text-slate-400 truncate max-w-[140px]">
                  {item.subLabel}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium font-mono text-[11px] rounded px-1.5 py-0.5",
                    item.deltaType === "positive" &&
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    item.deltaType === "neutral" &&
                      "bg-slate-800/60 text-slate-300 border border-slate-700/50"
                  )}
                >
                  {item.deltaType === "positive" && (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {item.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
