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
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className={cn("border-slate-800 bg-slate-950/60 shadow-sm flex flex-col justify-between", className)}>
      <div>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                  FRAC Baseline Mapping
                </span>
                <Badge variant="outline" className="text-xs font-mono text-slate-400 border-slate-800">
                  Live Radar
                </Badge>
              </div>
              <CardTitle className="mt-1 text-lg text-white">{officerName}</CardTitle>
              <CardDescription className="mt-0.5 text-xs text-slate-400">
                {cadreRank} Expected Standard Taxonomy
              </CardDescription>
            </div>

            {/* Legend Badges - Dual Blue Palette (Bright Sky + Deep Benchmark Blue) */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 text-slate-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-sky-400 shadow-sm shadow-sky-500/30" />
                <span>Assessed Level</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full border border-blue-600 border-dashed bg-blue-900/30" />
                <span>Cadre Benchmark</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* Radar Chart Visual with Layered Blue Depth Contours */}
          <div className="relative h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 20, right: 35, bottom: 20, left: 35 }}>
                {/* Subtle dark slate background grid */}
                <PolarGrid stroke="#1e293b" strokeDasharray="2 2" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "var(--font-ui, sans-serif)",
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, PROFICIENCY_MAX]}
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CompetencyItem & { gap: number };
                      return (
                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-xl text-xs font-mono">
                          <p className="font-semibold text-white">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.fracCode}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between gap-4 text-sky-400">
                              <span>Current Proficiency:</span>
                              <span className="font-bold">Lvl {item.current} / {PROFICIENCY_MAX}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-blue-300">
                              <span>Cadre Target:</span>
                              <span className="font-bold">Lvl {item.target} / {PROFICIENCY_MAX}</span>
                            </div>
                            {item.gap > 0 ? (
                              <div className="flex justify-between gap-4 text-rose-400 pt-1 border-t border-slate-800">
                                <span>Identified Deficit:</span>
                                <span className="font-bold">-{item.gap} Level(s)</span>
                              </div>
                            ) : (
                              <div className="text-emerald-400 pt-1 border-t border-slate-800">
                                ✓ Benchmark Met
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Cadre Benchmark Target Polygon (Deep Navy / Slate Blue with translucent underlay) */}
                <Radar
                  name="Cadre Benchmark"
                  dataKey="target"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="#1e3a8a"
                  fillOpacity={0.15}
                />
                {/* Officer Current Proficiency Polygon (Rich, vibrant Cyan / Sky Blue focal foreground) */}
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="#0284c7"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Competency Pill Selector */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 mr-1">Inspect:</span>
            {chartData.map((item) => {
              const isDeficit = item.gap > 0;
              const isSelected = focused?.fracCode === item.fracCode;
              return (
                <button
                  key={item.fracCode}
                  type="button"
                  onClick={() => setFocusedCode(item.fracCode)}
                  className={cn(
                    "inline-flex items-center rounded-md border text-xs px-2.5 py-1 transition-colors font-medium",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                  )}
                >
                  <span>{item.label}</span>
                  {isDeficit && (
                    <span
                      className={cn(
                        "ml-1.5 font-mono text-[11px] px-1.5 py-0.5 rounded border",
                        isSelected
                          ? "bg-blue-700/90 text-white border-blue-400/40"
                          : "bg-rose-950/50 text-rose-300 border-rose-800/40"
                      )}
                    >
                      -{item.gap}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Deficit Warning Banner */}
      {focused && (
        <div className="p-5 pt-0">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {focused.gap > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-950/30 px-2.5 py-0.5 text-xs font-medium text-rose-300 border border-rose-800/40">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span>Cadre Deficit: {focused.gap} Level(s) Gap</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-800/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Cadre Requirement Fulfilled</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-400">{focused.fracCode}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1.5">{focused.label}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current Level: <strong className="text-sky-400">Lvl {focused.current}</strong> of{" "}
                  <strong className="text-slate-200 font-semibold">Lvl {focused.target}</strong> expected for {cadreRank}
                </p>
              </div>

              {focused.gap > 0 && onTakeQuizForCompetency && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onTakeQuizForCompetency(focused.fracCode)}
                  className="gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  <span>Take Diagnostic Quiz</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
