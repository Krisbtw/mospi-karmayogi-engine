"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { TrendingUp, Layers, AlertTriangle, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompetencyItem, Officer } from "@/lib/data-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      iconColor: "text-sky-400 bg-sky-950/60 border-sky-800/60",
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
      iconColor: "text-indigo-400 bg-indigo-950/60 border-indigo-800/60",
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
      iconColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
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
      iconColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Executive Competency Telemetry · {officer.name} ({officer.cadreRank})
          </span>
        </div>
        <Badge variant="outline" className="text-xs text-slate-300 font-mono">
          Live FRAC Sync
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="border-slate-800/80 bg-slate-900/90 transition-colors hover:border-slate-700"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                      "flex h-9 w-9 items-center justify-center rounded-lg border",
                      item.iconColor
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {item.subLabel}
                  </span>

                  {item.deltaType === "positive" ? (
                    <Badge variant="success" className="font-mono text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {item.delta}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {item.delta}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
