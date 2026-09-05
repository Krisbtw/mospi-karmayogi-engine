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
import { AlertTriangle, CheckCircle2, TrendingUp, Sparkles, BrainCircuit } from "lucide-react";
import { CompetencyItem } from "@/lib/data-service";

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
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              FRAC Competency Baseline
            </p>
            <h3 className="text-lg font-semibold text-white">{officerName}</h3>
            <span className="mt-1 inline-block rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-medium text-sky-300">
              {cadreRank} Expected Standards
            </span>
          </div>

          {focused && focused.gap > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-2 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                Active Deficit: <strong className="text-white">{focused.label}</strong> (Lvl {focused.current} of {focused.target})
              </span>
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={chartData}
              onClick={(state) => {
                const code = state?.activePayload?.[0]?.payload?.fracCode;
                if (code) setFocusedCode((prev) => (prev === code ? null : code));
              }}
            >
              <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: "rgba(226, 232, 240, 0.8)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, PROFICIENCY_MAX]}
                tick={{ fill: "rgba(148, 163, 184, 0.6)", fontSize: 9 }}
              />
              <Radar
                name="Cadre Target Baseline"
                dataKey="target"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.12}
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <Radar
                name="Officer Current Level"
                dataKey="current"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.32}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Current Proficiency
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-emerald-400 border-dashed" /> Cadre Baseline ({cadreRank})
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-slate-500">Click axis to inspect</span>
        </div>
      </div>

      {/* Flagged Deficits List */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span>Identified Gaps ({activeGaps.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Click to take diagnostic quiz</span>
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {activeGaps.map((gap) => (
            <div
              key={gap.fracCode}
              className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-950/20 p-2.5 text-xs text-slate-300"
            >
              <div>
                <span className="font-semibold text-white">{gap.label}</span>
                <p className="text-[11px] text-slate-400">
                  Current: Level {gap.current} · Required: Level {gap.target} (Deficit: -{gap.gap})
                </p>
              </div>
              <button
                type="button"
                onClick={() => onTakeQuizForCompetency?.(gap.fracCode)}
                className="inline-flex items-center gap-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 text-[11px] font-medium text-amber-300 transition-colors"
              >
                <BrainCircuit className="h-3 w-3" />
                <span>Test Gap</span>
              </button>
            </div>
          ))}
          {activeGaps.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>All competencies meet or exceed the official {cadreRank} cadre baseline!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
