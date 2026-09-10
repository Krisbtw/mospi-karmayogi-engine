"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { TD_CADRE_HEATMAP_DATA } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOTAL_OFFICERS = TD_CADRE_HEATMAP_DATA.reduce((sum, d) => sum + d.totalOfficers, 0);

export function TdAdminDashboard() {
  const [dispatched, setDispatched] = useState(false);

  const handleDispatchBatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  return (
    <div className="flex flex-col gap-14">
      {/* Summary ledger: one wide dominant cell + three narrower cells */}
      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col justify-between gap-8 border-b border-border p-7 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
              Primary deficit area
            </p>
            <p className="mt-1 text-sm text-fg-muted">Across FOD and ESD cadres</p>
          </div>
          <div>
            <p className="text-4xl font-semibold leading-none tracking-tight text-fg text-balance">
              R/Python for survey microdata
            </p>
            <p className="mt-3 text-sm text-fg-muted">
              <span className="font-mono font-medium text-amber-700">71%</span> average deficit against
              the FRAC baseline
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-b border-border p-6 sm:border-r lg:border-b-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
            Officers monitored
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-fg">
              {TOTAL_OFFICERS.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">4 divisions · JSO, SO and DD ranks</p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-b border-border p-6 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
            iGOT enrolment rate
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-fg">83.7%</p>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              {Math.round(TOTAL_OFFICERS * 0.837)} officers with an active Sunbird course
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
            Post-training gain
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-emerald-700">
              +1.3 lvl
            </p>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              Median FRAC movement after certification
            </p>
          </div>
        </div>
      </div>

      {/* Division deficit matrix */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                Bharat FRAC cadre baselines
              </p>
              <CardTitle className="text-xl">Division competency deficit matrix</CardTitle>
              <CardDescription className="max-w-xl">
                Share of officers in each operational wing sitting below their cadre baseline, by competency.
              </CardDescription>
            </div>

            <Button
              type="button"
              variant={dispatched ? "success" : "default"}
              onClick={handleDispatchBatch}
              disabled={dispatched}
              className="shrink-0 gap-2 self-start sm:self-auto"
            >
              {dispatched ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  <span>Diagnostics dispatched</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  <span>Schedule cadre-wide diagnostic</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {dispatched && (
            <div className="mb-8 flex items-start gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-50 p-3.5 text-xs text-emerald-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
              <span className="text-pretty">
                Notifications sent to {TOTAL_OFFICERS.toLocaleString("en-IN")} officers across the NSSO and CSO
                regional directorates through the iGOT Karmayogi notification API.
              </span>
            </div>
          )}

          {/* Interactive Deficit Cohort Heatmap Grid */}
          <div className="mb-10 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-slate-50/70 p-4 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-fg">Cadre-Wide Deficit Heatmap Matrix</h4>
                <p className="text-xs text-fg-muted">Divisions (Y-Axis) × FRAC Competencies (X-Axis)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" /> &lt;20% Low Deficit</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500/25 border border-amber-500/50" /> 20-50% Moderate</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500/25 border border-red-500/50" /> &gt;50% Critical Priority</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-border bg-slate-100/50 text-[11px] font-mono text-fg-muted uppercase tracking-wider">
                    <th className="p-3.5 pl-5 font-semibold text-fg">Operational Wing / Division</th>
                    <th className="p-3.5 font-semibold text-center">Officers</th>
                    <th className="p-3.5 font-semibold">Survey Sampling</th>
                    <th className="p-3.5 font-semibold">Price Indexing (CPI)</th>
                    <th className="p-3.5 font-semibold">R/Python Microdata</th>
                    <th className="p-3.5 font-semibold">Data Ethics & Laws</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {TD_CADRE_HEATMAP_DATA.map((row) => {
                    const getCompGap = (keyword: string) => {
                      const found = row.competencies.find((c) =>
                        c.label.toLowerCase().includes(keyword.toLowerCase())
                      );
                      return found ? found.gapPercent : null;
                    };

                    const renderCell = (gap: number | null) => {
                      if (gap === null) return <span className="text-slate-300 font-mono">—</span>;
                      const isHigh = gap >= 50;
                      const isMod = gap >= 20 && gap < 50;
                      return (
                        <div
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold transition-all hover:scale-105 shadow-sm",
                            isHigh
                              ? "bg-red-500/15 text-red-700 border border-red-500/30 dark:text-red-300"
                              : isMod
                              ? "bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300"
                              : "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300"
                          )}
                          title={`${gap}% of cadre sitting below FRAC standard`}
                        >
                          {gap}%
                        </div>
                      );
                    };

                    return (
                      <tr key={row.division} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 pl-5 font-medium text-fg">
                          <div>
                            <span className="text-sm font-semibold">{row.division}</span>
                            <span className="block text-[11px] text-fg-muted font-normal">{row.cadreBreakdown}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-semibold text-fg">
                          {row.totalOfficers}
                        </td>
                        <td className="p-3.5">{renderCell(getCompGap("Sampling") ?? getCompGap("Industrial"))}</td>
                        <td className="p-3.5">{renderCell(getCompGap("Price") ?? getCompGap("National"))}</td>
                        <td className="p-3.5">{renderCell(getCompGap("R/Python"))}</td>
                        <td className="p-3.5">{renderCell(getCompGap("Integrity") ?? getCompGap("Sampling"))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Division deficit matrix */}
          <div className="flex flex-col divide-y divide-border">
            {TD_CADRE_HEATMAP_DATA.map((division, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div
                  key={division.division}
                  className={cn(
                    "grid grid-cols-1 gap-6 py-8 first:pt-0 last:pb-0 lg:grid-cols-12 lg:gap-10",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col justify-between gap-4 lg:col-span-4",
                      reversed && "lg:order-2 lg:col-start-9"
                    )}
                  >
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight text-fg text-balance">
                        {division.division}
                      </h4>
                      <p className="mt-1 text-xs text-fg-muted">{division.cadreBreakdown}</p>
                    </div>
                    <p className="font-data text-2xl font-semibold text-fg">
                      {division.totalOfficers}
                      <span className="ml-1.5 font-sans text-xs font-normal text-fg-muted">officers</span>
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex flex-col gap-4 lg:col-span-8",
                      reversed && "lg:order-1 lg:col-start-1"
                    )}
                  >
                    {division.competencies.map((comp) => {
                      const isCritical = comp.gapPercent >= 60;
                      const isModerate = comp.gapPercent >= 35 && comp.gapPercent < 60;

                      return (
                        <div key={comp.code} className="flex flex-col gap-1.5">
                          <div className="flex items-baseline justify-between gap-4 text-xs">
                            <span className="truncate font-medium text-fg-muted">{comp.label}</span>
                            <span
                              className={cn(
                                "shrink-0 font-mono tabular-nums",
                                isCritical
                                  ? "text-red-700"
                                  : isModerate
                                  ? "text-amber-700"
                                  : "text-emerald-700"
                              )}
                            >
                              {comp.gapPercent}% below baseline
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                            <div
                              className={cn(
                                "h-full rounded-full transition-[width] duration-700 ease-out",
                                isCritical ? "bg-red-600" : isModerate ? "bg-primary" : "bg-emerald-600"
                              )}
                              style={{ width: `${comp.gapPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
