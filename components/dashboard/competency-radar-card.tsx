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
  const [evidenceOpen, setEvidenceOpen] = useState(false);
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
    <Card className={cn("competency-card", className)}>
      <div className="panel-heading"><div><h2>Your competency map</h2><p>Assessment estimate</p></div></div>
      <div className="competency-bars">
        {chartData.slice(0, 3).map((item) => (
          <button key={item.fracCode} className="competency-bar-row" onClick={() => { setFocusedCode(item.fracCode); setEvidenceOpen(true); }} aria-label={            item.label + ": assessed " + item.current + " of " + PROFICIENCY_MAX + ", role target " + item.target + ". View gap evidence."
          }>
            <span className="competency-bar-label" title={item.label}>{item.label}</span>
            <span className="competency-track"><span className="competency-fill" style={{ width: (item.current / PROFICIENCY_MAX * 100) + "%" }} /><span className="competency-target" style={{ left: (item.target / PROFICIENCY_MAX * 100) + "%" }} /></span>
            <span className="competency-percent">{Math.round(item.current / PROFICIENCY_MAX * 100)}%</span>
          </button>
        ))}
      </div>
      <div className="competency-legend"><span><i />Assessed</span><span><i />Role target</span></div>
      <button className="text-action evidence-toggle" onClick={() => setEvidenceOpen(!evidenceOpen)} aria-expanded={evidenceOpen} aria-controls="competency-evidence">{evidenceOpen ? "Hide gap evidence" : "See gap evidence"}<ArrowRight aria-hidden="true" /></button>
      <div id="competency-evidence" hidden={!evidenceOpen} className="competency-evidence">
      <div>
        <CardHeader className="pb-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
            FRAC baseline mapping
          </p>
          <CardTitle className="text-lg">{officerName}</CardTitle>
          <CardDescription>Assessed level against the {cadreRank} expected standard</CardDescription>

          <div className="mt-3 flex items-center gap-5 text-xs text-fg-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
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
            {evidenceOpen && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="65%" margin={{ top: 24, right: 20, bottom: 24, left: 20 }}>
                <defs>
                  {/* Ashoka Blue / MoSPI Teal Gradient Mesh Fills */}
                  <linearGradient id="ashoka-mesh-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#007C83" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="benchmark-mesh-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.04" />
                  </linearGradient>
                  <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284C7" floodOpacity="0.3" />
                  </filter>
                </defs>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" strokeOpacity={0.7} />
                <PolarAngleAxis
                  dataKey="label"
                  tick={({ payload, x, y, textAnchor }) => {
                    const lines: string[] = [];
                    String(payload.value).split(" ").forEach((word) => {
                      const last = lines.length - 1;
                      if (last >= 0 && `${lines[last]} ${word}`.length <= 15) lines[last] += ` ${word}`;
                      else lines.push(word);
                    });
                    return <text x={x} y={y} textAnchor={textAnchor} fill="#334155" fontSize={11} fontWeight={600} fontFamily="var(--font-ui), sans-serif">{lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? -(lines.length - 1) * 6 : 12}>{line}</tspan>)}</text>;
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, PROFICIENCY_MAX]}
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={false}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CompetencyItem & { gap: number };
                      return (
                        <div className="rounded-lg border border-border bg-surface/95 backdrop-blur-md p-3.5 font-mono text-xs shadow-xl ring-1 ring-black/5">
                          <p className="font-semibold text-fg text-sm">{item.label}</p>
                          <p className="text-[11px] text-fg-muted">{item.fracCode}</p>
                          <div className="mt-2.5 flex flex-col gap-1.5">
                            <div className="flex justify-between gap-6 text-primary">
                              <span>Assessed Level</span>
                              <span className="font-semibold font-mono">
                                Level {item.current} / {PROFICIENCY_MAX}
                              </span>
                            </div>
                            <div className="flex justify-between gap-6 text-fg">
                              <span>FRAC Target</span>
                              <span className="font-semibold font-mono">
                                Level {item.target} / {PROFICIENCY_MAX}
                              </span>
                            </div>
                            {item.gap > 0 ? (
                              <div className="flex justify-between gap-6 border-t border-border pt-1.5 text-rose-600 font-semibold">
                                <span>Deficit Gap</span>
                                <span>−{item.gap} Levels</span>
                              </div>
                            ) : (
                              <div className="border-t border-border pt-1.5 text-emerald-600 font-semibold">
                                ✓ Cadre Target Achieved
                              </div>
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
                  fill="url(#benchmark-mesh-fill)"
                />
                <Radar
                  name="Assessed level"
                  dataKey="current"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  fill="url(#ashoka-mesh-fill)"
                  filter="url(#radar-glow)"
                />
              </RadarChart>
            </ResponsiveContainer>
            )}
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
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    isSelected
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-bg text-fg-muted hover:border-slate-600 hover:bg-slate-100 hover:text-fg"
                  )}
                >
                  <span>{item.label}</span>
                  {isDeficit && (
                    <span className="font-mono text-[11px] text-rose-700">−{item.gap}</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </div>

      {/* Focused competency detail */}
      {focused && (
        <div className="border-t border-border p-6">
          <div className="flex flex-col items-start gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                {focused.fracCode}
                {focused.gap > 0 ? (
                  <span className="text-rose-700"> · deficit of {focused.gap} level{focused.gap === 1 ? "" : "s"}</span>
                ) : (
                  <span className="text-emerald-700"> · requirement met</span>
                )}
              </p>
              <h4 className="mt-1.5 text-base font-semibold tracking-tight text-fg text-balance">
                {focused.label}
              </h4>
              <p className="mt-1 text-xs text-fg-muted">
                Assessed at <strong className="font-semibold text-primary">level {focused.current}</strong>; the{" "}
                {cadreRank} benchmark is{" "}
                <strong className="font-semibold text-fg">level {focused.target}</strong>.
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
      </div>
    </Card>
  );
}
