"use client";

import { useState } from "react";
import {
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  Send,
  CheckCircle2,
  Building2,
  Layers,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { TD_CADRE_HEATMAP_DATA } from "@/lib/data-service";

export function TdAdminDashboard() {
  const [dispatched, setDispatched] = useState(false);

  const handleDispatchBatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cadre Officers Monitored</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">950 Officers</p>
          <p className="text-xs text-slate-500 mt-1">4 Divisions · JSO, SO, DD Ranks</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Primary Deficit Area</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-amber-400 truncate">R/Python Microdata</p>
          <p className="text-xs text-slate-500 mt-1">71% average deficit in FOD/ESD</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">iGOT Enrollment Rate</span>
            <GraduationCap className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">84.6%</p>
          <p className="text-xs text-slate-500 mt-1">620 active Sunbird course learners</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Capacity Building ROI</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-400">+1.4 Levels</p>
          <p className="text-xs text-slate-500 mt-1">Average post-training gain on FRAC</p>
        </div>
      </div>

      {/* Cadre Heatmap & Action Section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sky-400" />
              <h3 className="text-lg font-semibold text-white">MoSPI Division Competency Deficit Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated skill gap percentages against Bharat FRAC Cadre Baselines across MoSPI operational wings
            </p>
          </div>

          <button
            type="button"
            onClick={handleDispatchBatch}
            disabled={dispatched}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md self-start sm:self-auto"
          >
            {dispatched ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span>Batch Assessments Dispatched!</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Schedule Cadre-Wide Diagnostic</span>
              </>
            )}
          </button>
        </div>

        {dispatched && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Diagnostic Dispatch Complete:</strong> Notifications sent to 950 cadre officers across NSSO/CSO regional offices via iGOT Karmayogi notification API.
            </span>
          </div>
        )}

        {/* Division Heatmap Cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {TD_CADRE_HEATMAP_DATA.map((division) => (
            <div
              key={division.division}
              className="rounded-xl border border-white/10 bg-slate-950/60 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="font-semibold text-sm text-white">{division.division}</h4>
                  <p className="text-[11px] text-slate-400">{division.cadreBreakdown}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {division.totalOfficers} Officers
                </span>
              </div>

              {/* Competency Gap Intensity Bars */}
              <div className="space-y-3">
                {division.competencies.map((comp) => {
                  const isCritical = comp.gapPercent >= 60;
                  const isModerate = comp.gapPercent >= 35 && comp.gapPercent < 60;

                  return (
                    <div key={comp.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate pr-2">
                          {comp.label}
                        </span>
                        <span
                          className={`font-semibold shrink-0 ${
                            isCritical
                              ? "text-rose-400"
                              : isModerate
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {comp.gapPercent}% Gap
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical
                              ? "bg-rose-500"
                              : isModerate
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${comp.gapPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
