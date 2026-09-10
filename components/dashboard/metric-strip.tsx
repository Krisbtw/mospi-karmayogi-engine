"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { Target, TriangleAlert, CalendarDays, Info } from "lucide-react";
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

  return (
    <div className="metric-strip" aria-label="Competency telemetry">
      <div className="metric-card"><span className="metric-icon"><Target aria-hidden="true" /></span><div><strong>{met} of {competencies.length}</strong><p>Skills on target</p></div><details className="metric-more"><summary aria-label="Coverage details"><Info /></summary><p>{coveragePercent}% FRAC coverage · {officer.cadreRank} baseline<br />{competencies.length} competencies monitored</p></details></div>
      <div className="metric-card"><span className="metric-icon"><TriangleAlert aria-hidden="true" /></span><div><strong>{activeGaps.length}</strong><p>Priority gaps</p></div><details className="metric-more"><summary aria-label="Skill deficit details"><Info /></summary><p>{avgGap.toFixed(1)} levels average skill deficit<br />{totalGapScore} total levels to close</p></details></div>
      <div className="metric-card"><span className="metric-icon"><CalendarDays aria-hidden="true" /></span><div><strong><NumberTicker value={estimatedHours} suffix=" h" /></strong><p>Learning hours · simulated</p></div><details className="metric-more"><summary aria-label="Learning ledger details"><Info /></summary><p>{completedCoursesCount} module certificates<br />Demo sandbox learning ledger</p></details></div>
    </div>
  );
}
