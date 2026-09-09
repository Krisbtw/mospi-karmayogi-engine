"use client";

import { useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompetencyRadarCardProps {
  officerName: string;
  cadreRank: string;
  data: CompetencyItem[];
  onTakeQuizForCompetency?: (fracCode: string) => void;
  className?: string;
}

const PROFICIENCY_MAX = 5;

export function CompetencyRadarCard({
  officerName,
  cadreRank,
  data,
  onTakeQuizForCompetency,
  className,
}: CompetencyRadarCardProps) {
  const [focusedCode, setFocusedCode] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        gap: Math.max(d.target - d.current, 0),
      })),
    [data]
  );

  const largestGap = useMemo(
    () => [...chartData].sort((a, b) => b.gap - a.gap)[0],
    [chartData]
  );

  const focused = focusedCode
    ? chartData.find((d) => d.fracCode === focusedCode) || largestGap
    : largestGap;

  return (
    <Card className={cn("flex h-full flex-col justify-between", className)}>
      <div>
        <CardHeader className="pb-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            FRAC baseline mapping
          </p>
          <CardTitle className="text-lg">{officerName}</CardTitle>
          <CardDescription>Assessed level against the {cadreRank} expected standard</CardDescription>

          <div className="mt-3 flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              Assessed level
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full border border-dashed border-slate-400" aria-hidden />
              Cadre benchmark
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="relative h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 20, right: 35, bottom: 20, left: 35 }}>
                <PolarGrid stroke="#1e293b" strokeDasharray="2 2" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--font-geist-sans), sans-serif",
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, PROFICIENCY_MAX]}
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CompetencyItem & { gap: number };
                      return (
                        <div className="rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-xs shadow-lg">
                          <p className="font-semibold text-white">{item.label}</p>
                          <p className="text-slate-500">{item.fracCode}</p>
                          <div className="mt-2 flex flex-col gap-1">
                            <div className="flex justify-between gap-4 text-amber-300">
                              <span>Assessed</span>
                              <span className="font-semibold">
                                {item.current} / {PROFICIENCY_MAX}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>Benchmark</span>
                              <span className="font-semibold">
                                {item.target} / {PROFICIENCY_MAX}
                              </span>
                            </div>
                            {item.gap > 0 ? (
                              <div className="flex justify-between gap-4 border-t border-slate-800 pt-1 text-rose-300">
                                <span>Deficit</span>
                                <span className="font-semibold">−{item.gap}</span>
                              </div>
                            ) : (
                              <div className="border-t border-slate-800 pt-1 text-emerald-300">Benchmark met</div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Cadre benchmark"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="#64748b"
                  fillOpacity={0.12}
                />
                <Radar
                  name="Assessed level"
                  dataKey="current"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="#d97706"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Competency selector */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {chartData.map((item) => {
              const isDeficit = item.gap > 0;
              const isSelected = focused?.fracCode === item.fracCode;
              return (
                <button
                  key={item.fracCode}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFocusedCode(item.fracCode)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                    isSelected
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <span>{item.label}</span>
                  {isDeficit && (
                    <span className="font-mono text-[11px] text-rose-300">−{item.gap}</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Focused competency detail */}
      {focused && (
        <div className="border-t border-slate-800 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                {focused.fracCode}
                {focused.gap > 0 ? (
                  <span className="text-rose-300"> · deficit of {focused.gap} level{focused.gap === 1 ? "" : "s"}</span>
                ) : (
                  <span className="text-emerald-300"> · requirement met</span>
                )}
              </p>
              <h4 className="mt-1.5 text-base font-semibold tracking-tight text-white text-balance">
                {focused.label}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                Assessed at <strong className="font-semibold text-amber-300">level {focused.current}</strong>; the{" "}
                {cadreRank} benchmark is{" "}
                <strong className="font-semibold text-slate-200">level {focused.target}</strong>.
              </p>
            </div>

            {focused.gap > 0 && onTakeQuizForCompetency && (
              <Button
                type="button"
                size="sm"
                onClick={() => onTakeQuizForCompetency(focused.fracCode)}
                className="shrink-0 gap-1.5"
              >
                <span>Take diagnostic quiz</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
