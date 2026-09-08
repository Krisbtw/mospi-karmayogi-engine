"use client";

import { useState } from "react";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Send,
  CheckCircle2,
  Building2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { TD_CADRE_HEATMAP_DATA } from "@/lib/data-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TdAdminDashboard() {
  const [dispatched, setDispatched] = useState(false);

  const handleDispatchBatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Top summary cards using Shadcn Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Cadre Officers Monitored
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-sky-400 border border-slate-700/60">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-white">950 Officers</p>
            <p className="text-xs text-slate-400 mt-1">4 Divisions · JSO, SO, DD Ranks</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Primary Deficit Area
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-amber-400 border border-slate-700/60">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-amber-400 truncate">R/Python Microdata</p>
            <p className="text-xs text-slate-400 mt-1">71% average deficit in FOD/ESD</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                iGOT Enrollment Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-emerald-400 border border-slate-700/60">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">84.6%</p>
            <p className="text-xs text-slate-400 mt-1">620 active Sunbird course learners</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Capacity Building Gain
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-sky-400 border border-slate-700/60">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-sky-400">+1.4 Levels</p>
            <p className="text-xs text-slate-400 mt-1">Average post-training gain on FRAC</p>
          </CardContent>
        </Card>
      </div>

      {/* Cadre Heatmap & Action Section */}
      <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-950 text-sky-400 border border-sky-800/60">
                  <Building2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">MoSPI Division Competency Deficit Matrix</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Aggregated skill gap percentages against Bharat FRAC Cadre Baselines across MoSPI operational wings
              </CardDescription>
            </div>

            <Button
              type="button"
              variant={dispatched ? "success" : "default"}
              onClick={handleDispatchBatch}
              disabled={dispatched}
              className="gap-2 self-start sm:self-auto"
            >
              {dispatched ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Batch Assessments Dispatched</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Schedule Cadre-Wide Diagnostic</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {dispatched && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 flex items-center gap-2 font-mono">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Diagnostic Dispatch Complete:</strong> Targeted notifications dispatched to 950 cadre officers across NSSO/CSO regional directorates via iGOT Karmayogi notification API.
              </span>
            </div>
          )}

          {/* Division Heatmap Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {TD_CADRE_HEATMAP_DATA.map((division) => (
              <div
                key={division.division}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{division.division}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{division.cadreBreakdown}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {division.totalOfficers} Officers
                  </Badge>
                </div>

                {/* Competency Gap Intensity Bars */}
                <div className="space-y-3">
                  {division.competencies.map((comp) => {
                    const isCritical = comp.gapPercent >= 60;
                    const isModerate = comp.gapPercent >= 35 && comp.gapPercent < 60;

                    return (
                      <div key={comp.code} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate pr-2">
                            {comp.label}
                          </span>
                          <Badge
                            variant={isCritical ? "destructive" : isModerate ? "warning" : "success"}
                            className="font-mono text-xs py-0"
                          >
                            {comp.gapPercent}% Gap
                          </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
