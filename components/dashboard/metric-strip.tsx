"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
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
    <span className={cn("inline-block font-data", className)} ref={ref}>
      {prefix}
      {value.toFixed(decimalPlaces)}
      {suffix}
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

  const secondary = [
    {
      id: "competencies",
      label: "Competencies monitored",
      value: competencies.length,
      decimalPlaces: 0,
      suffix: "",
      note: `${officer.cadreRank} taxonomy · 4 domains`,
    },
    {
      id: "deficit",
      label: "Average skill deficit",
      value: avgGap,
      decimalPlaces: 1,
      suffix: " lvl",
      note: `${activeGaps.length} open gap${activeGaps.length === 1 ? "" : "s"} · down 0.4 since Q1`,
    },
    {
      id: "hours",
      label: "Verified learning hours",
      value: estimatedHours,
      decimalPlaces: 0,
      suffix: " h",
      note: `${completedCoursesCount} Sunbird certificate${completedCoursesCount === 1 ? "" : "s"} recorded`,
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Competency telemetry
        </h2>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-amber-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
          </span>
          FRAC sync · live
        </span>
      </div>

      {/* Ledger: one dominant cell, three supporting cells, hairline dividers instead of card chrome */}
      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative flex flex-col justify-between gap-8 border-b border-slate-800 p-7 sm:col-span-2 sm:border-b lg:col-span-1 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Cadre FRAC coverage
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {met} of {total} standards met at {officer.cadreRank} baseline
            </p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="text-6xl font-semibold leading-none tracking-tighter text-white">
              <NumberTicker value={coveragePercent} suffix="%" delay={0.05} />
            </span>
            <span className="mb-1 rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300">
              +11.7 pts since Apr
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-[width] duration-700 ease-out"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>

        {secondary.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              "flex flex-col justify-between gap-6 p-6",
              "border-slate-800 sm:border-b lg:border-b-0",
              idx === 0 && "sm:border-r",
              idx === 1 && "lg:border-r",
              idx === 2 && "sm:col-span-2 sm:border-b-0 lg:col-span-1 lg:border-l"
            )}
          >
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              {item.label}
            </p>
            <div>
              <span className="text-3xl font-semibold leading-none tracking-tight text-white">
                <NumberTicker
                  value={item.value}
                  decimalPlaces={item.decimalPlaces}
                  suffix={item.suffix}
                  delay={0.1 + 0.05 * idx}
                />
              </span>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 text-pretty">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
