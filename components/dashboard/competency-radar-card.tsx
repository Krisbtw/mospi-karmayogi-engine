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
  BrainCircuit,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
} from "lucide-react";
import { CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";

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

  const activeGaps = useMemo(() => chartData.filter((d) => d.gap > 0), [chartData]);
  const largestGap = useMemo(
    () => [...chartData].sort((a, b) => b.gap - a.gap)[0],
    [chartData]
  );

  const focused = focusedCode
    ? chartData.find((d) => d.fracCode === focusedCode) || largestGap
    : largestGap;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Header Telemetry */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                FRAC Baseline Mapping
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-mono text-sky-300">
                <Sparkles className="h-2.5 w-2.5 text-sky-400" />
                Live Radar
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">{officerName}</h3>
            <span className="mt-1 inline-block rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-mono text-slate-300">
              {cadreRank} Expected Standard
            </span>
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
              <span className="text-slate-300">Assessed Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-amber-400 bg-amber-400/30" />
              <span className="text-amber-300">Cadre Benchmark</span>
            </div>
          </div>
        </div>

        {/* Radar Chart Visual */}
        <div className="relative h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#1e293b" strokeDasharray="2 2" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-ui, sans-serif)" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, PROFICIENCY_MAX]}
                tick={{ fill: "#64748b", fontSize: 9 }}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CompetencyItem & { gap: number };
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400">{item.fracCode}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between gap-4 text-sky-300">
                            <span>Current Proficiency:</span>
                            <span className="font-bold">Lvl {item.current} / {PROFICIENCY_MAX}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-amber-300">
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
              {/* Cadre Benchmark Target Polygon (dashed Amber) */}
              <Radar
                name="Cadre Benchmark"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                fill="#f59e0b"
                fillOpacity={0.12}
              />
              {/* Officer Current Proficiency Polygon (Ashoka Blue) */}
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
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Inspect Competency:</span>
          {chartData.map((item) => {
            const isDeficit = item.gap > 0;
            const isSelected = focused?.fracCode === item.fracCode;
            return (
              <button
                key={item.fracCode}
                type="button"
                onClick={() => setFocusedCode(item.fracCode)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-mono transition-all",
                  isSelected
                    ? "bg-sky-500 text-white font-bold shadow-sm"
                    : isDeficit
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                {item.label}
                {isDeficit && <span className="ml-1 text-[10px] text-amber-400">(-{item.gap})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deficit Inspector & Targeted AI Diagnostic Launcher */}
      {focused && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {focused.gap > 0 ? (
                  <span className="flex items-center gap-1 text-xs font-mono font-semibold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Cadre Deficit: {focused.gap} Level(s) Gap
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Cadre Requirement Fulfilled
                  </span>
                )}
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs font-mono text-slate-400">{focused.fracCode}</span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">{focused.label}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Level: <strong className="text-sky-300">Lvl {focused.current}</strong> of{" "}
                <strong className="text-amber-300">Lvl {focused.target}</strong> expected for {cadreRank}
              </p>
            </div>

            {focused.gap > 0 && onTakeQuizForCompetency && (
              <button
                type="button"
                onClick={() => onTakeQuizForCompetency(focused.fracCode)}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition-all shadow-md shrink-0"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Take Diagnostic Quiz</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
