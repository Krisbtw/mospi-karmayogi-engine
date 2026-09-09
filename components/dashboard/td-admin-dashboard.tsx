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
      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col justify-between gap-8 border-b border-slate-800 p-7 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Primary deficit area
            </p>
            <p className="mt-1 text-sm text-slate-400">Across FOD and ESD cadres</p>
          </div>
          <div>
            <p className="text-4xl font-semibold leading-none tracking-tight text-white text-balance">
              R/Python for survey microdata
            </p>
            <p className="mt-3 text-sm text-slate-400">
              <span className="font-mono font-medium text-amber-300">71%</span> average deficit against
              the FRAC baseline
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 p-6 sm:border-r lg:border-b-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            Officers monitored
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-white">
              {TOTAL_OFFICERS.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">4 divisions · JSO, SO and DD ranks</p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 p-6 lg:border-b-0 lg:border-r">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            iGOT enrolment rate
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-white">83.7%</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {Math.round(TOTAL_OFFICERS * 0.837)} officers with an active Sunbird course
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            Post-training gain
          </p>
          <div>
            <p className="font-data text-3xl font-semibold leading-none tracking-tight text-emerald-300">
              +1.3 lvl
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
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
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
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
            <div className="mb-8 flex items-start gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
              <span className="text-pretty">
                Notifications sent to {TOTAL_OFFICERS.toLocaleString("en-IN")} officers across the NSSO and CSO
                regional directorates through the iGOT Karmayogi notification API.
              </span>
            </div>
          )}

          {/* Zig-zag: alternate rows swap the header and bar columns so the eye doesn't scan a uniform grid */}
          <div className="flex flex-col divide-y divide-slate-800">
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
                      <h4 className="text-lg font-semibold tracking-tight text-white text-balance">
                        {division.division}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">{division.cadreBreakdown}</p>
                    </div>
                    <p className="font-data text-2xl font-semibold text-slate-200">
                      {division.totalOfficers}
                      <span className="ml-1.5 font-sans text-xs font-normal text-slate-500">officers</span>
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
                            <span className="truncate font-medium text-slate-300">{comp.label}</span>
                            <span
                              className={cn(
                                "shrink-0 font-mono tabular-nums",
                                isCritical
                                  ? "text-rose-300"
                                  : isModerate
                                  ? "text-amber-300"
                                  : "text-emerald-300"
                              )}
                            >
                              {comp.gapPercent}% below baseline
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={cn(
                                "h-full rounded-full transition-[width] duration-700 ease-out",
                                isCritical ? "bg-rose-400/80" : isModerate ? "bg-amber-400" : "bg-emerald-400/80"
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
