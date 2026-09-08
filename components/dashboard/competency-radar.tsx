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
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CompetencyRadarProps {
  officerName: string;
  cadreRank: string;
  data: CompetencyItem[];
  onTakeQuizForCompetency?: (fracCode: string) => void;
}

const PROFICIENCY_MAX = 5;

export function CompetencyRadar({
  officerName,
  cadreRank,
  data,
  onTakeQuizForCompetency,
}: CompetencyRadarProps) {
  const [focusedCode, setFocusedCode] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        gap: Math.max(d.target - d.current, 0),
      })),
    [data]
  );

  const activeGaps = useMemo(() => chartData.filter((d) => d.gap > 0), [chartData]);
  const largestGap = useMemo(
    () => [...chartData].sort((a, b) => b.gap - a.gap)[0],
    [chartData]
  );

  const focused = focusedCode ? chartData.find((d) => d.fracCode === focusedCode) : largestGap;

  return (
    <Card className="border-slate-800 bg-slate-950/60 shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                FRAC Competency Baseline
              </span>
              <CardTitle className="mt-1 text-lg text-white">{officerName}</CardTitle>
              <CardDescription className="mt-0.5 text-xs text-slate-400">
                {cadreRank} Expected Standards
              </CardDescription>
            </div>

            {focused && focused.gap > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-950/30 px-2.5 py-1 text-xs font-medium text-rose-300 border border-rose-800/40">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>
                  Active Deficit: <strong className="text-white">{focused.label}</strong> (Lvl {focused.current} of {focused.target})
                </span>
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Radar Chart with Dual-Tone Blue Translucent Contours */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={chartData}
                margin={{ top: 20, right: 35, bottom: 20, left: 35 }}
                onClick={(state) => {
                  const code = state?.activePayload?.[0]?.payload?.fracCode;
                  if (code) setFocusedCode((prev) => (prev === code ? null : code));
                }}
              >
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
                {/* Cadre Benchmark Target Polygon (Deep Blue dashed contour) */}
                <Radar
                  name="Cadre Benchmark"
                  dataKey="target"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="#1e3a8a"
                  fillOpacity={0.15}
                />
                {/* Officer Current Proficiency Polygon (Rich Cyan / Sky Blue foreground) */}
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="#0284c7"
                  fillOpacity={0.45}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - Dual Blue Palette */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 text-slate-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-sky-400 shadow-sm shadow-sky-500/30" />
                <span>Current Proficiency</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full border border-blue-600 border-dashed bg-blue-900/30" />
                <span>Cadre Benchmark</span>
              </Badge>
            </div>
            <span className="hidden sm:inline text-xs text-slate-500">Click axis to inspect</span>
          </div>

          {/* Competency Chip Selector */}
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

      {/* Flagged Deficits List */}
      <div className="p-5 pt-0">
        <div className="border-t border-slate-800/80 pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Identified Gaps ({activeGaps.length})
            </h4>
            <span className="text-xs text-slate-500 font-normal">Click to take diagnostic quiz</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {activeGaps.map((gap) => (
              <div
                key={gap.fracCode}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-xs text-slate-300"
              >
                <div>
                  <span className="font-semibold text-white">{gap.label}</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Current: <strong className="text-sky-400">Lvl {gap.current}</strong> · Required: <strong className="text-slate-200">Lvl {gap.target}</strong> (Deficit: <span className="text-rose-400 font-mono">-{gap.gap}</span>)
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onTakeQuizForCompetency?.(gap.fracCode)}
                  className="h-7 px-2.5 text-xs gap-1 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700"
                >
                  <span>Test Gap</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {activeGaps.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-950/20 border border-emerald-800/40 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>All competencies meet or exceed the official {cadreRank} cadre baseline!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
