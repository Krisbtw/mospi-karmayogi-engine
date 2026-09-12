"use client";

import React, { useState } from "react";
import { Search, Filter, User, ArrowRight, CheckCircle2, AlertTriangle, Eye, X, BookOpen } from "lucide-react";
import { Officer, CompetencyItem } from "@/lib/data-service";
import { CompetencyRadarCard } from "@/components/dashboard/competency-radar-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OfficerManagementViewProps {
  officers: Officer[];
  officerProficiencies: Record<string, CompetencyItem[]>;
  onInspectOfficer?: (officer: Officer) => void;
}

export function OfficerManagementView({
  officers,
  officerProficiencies,
  onInspectOfficer,
}: OfficerManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [inspectingOfficer, setInspectingOfficer] = useState<Officer | null>(null);

  // Compute officer stats
  const officersWithStats = officers.map((off) => {
    const comps = officerProficiencies[off.id] || [];
    const total = comps.length || 6;
    const metCount = comps.filter((c) => c.current >= c.target).length;
    const activeGaps = comps.filter((c) => c.current < c.target).sort((a, b) => (b.target - b.current) - (a.target - a.current));
    const primaryGap = activeGaps[0] || null;
    const complianceRate = Math.round((metCount / total) * 100);

    return {
      officer: off,
      competencies: comps,
      metCount,
      total,
      complianceRate,
      primaryGap,
      activeGapCount: activeGaps.length,
    };
  });

  const divisions = ["ALL", ...Array.from(new Set(officers.map((o) => o.division.split(" ")[0])))];

  const filteredOfficers = officersWithStats.filter(({ officer }) => {
    const matchesSearch =
      officer.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      officer.designation.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      officer.division.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      officer.cadreRank.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesDivision =
      selectedDivision === "ALL" || officer.division.startsWith(selectedDivision);

    return matchesSearch && matchesDivision;
  });

  const totalMonitored = officers.length;
  const avgCompliance = Math.round(
    officersWithStats.reduce((sum, o) => sum + o.complianceRate, 0) / (totalMonitored || 1)
  );
  const totalGaps = officersWithStats.reduce((sum, o) => sum + o.activeGapCount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-fg">Officer Cadre Management</h2>
          <p className="text-xs text-fg-muted mt-1">
            Directory of MoSPI statistical officers. Monitor cadre compliance and review individual competency baselines.
          </p>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">Officers in Active Cadres</p>
            <p className="text-2xl font-bold text-fg">{totalMonitored}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">Average FRAC Compliance</p>
            <p className="text-2xl font-bold text-emerald-700">{avgCompliance}%</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted">Active Proficiency Deficits</p>
            <p className="text-2xl font-bold text-amber-700">{totalGaps} Deficits</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-fg-muted" />
          <input
            type="text"
            placeholder="Search officer name, rank, or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent py-1.5 pl-9 pr-3 text-xs text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-fg-muted shrink-0" />
          <span className="text-xs text-fg-muted">Division:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-fg focus:border-primary focus:outline-none"
          >
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div === "ALL" ? "All Divisions" : div}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                <th className="py-3 px-4 font-semibold text-fg">Officer Name & Cadre</th>
                <th className="py-3 px-4 font-semibold">Operational Division</th>
                <th className="py-3 px-4 font-semibold">FRAC Status</th>
                <th className="py-3 px-4 font-semibold">Primary Priority Gap</th>
                <th className="py-3 px-4 font-semibold">iGOT Enrolment</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredOfficers.map(({ officer, competencies, metCount, total, complianceRate, primaryGap }) => (
                <tr key={officer.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {officer.avatar}
                      </span>
                      <div>
                        <p className="font-semibold text-fg">{officer.name}</p>
                        <p className="text-[11px] text-fg-muted">{officer.cadreRank} · {officer.designation}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-medium text-fg">{officer.division}</p>
                    <p className="text-[11px] text-fg-muted">{officer.region}</p>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-fg">{metCount} of {total}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary font-mono">
                        {complianceRate}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {primaryGap ? (
                      <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">{primaryGap.label}</span>
                        <span className="font-mono text-[10px] font-bold text-rose-700 dark:text-rose-400">
                          −{primaryGap.target - primaryGap.current}
                        </span>
                      </div>
                    ) : (
                      <span className="text-emerald-700 text-[11px] font-semibold">✓ All targets met</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-fg-muted font-mono">
                      <BookOpen className="h-3 w-3" />
                      <span>{officer.igotUserId}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInspectingOfficer(officer);
                        if (onInspectOfficer) onInspectOfficer(officer);
                      }}
                      className="gap-1.5 text-xs h-7 border-primary/40 hover:bg-primary/10 text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect Profile</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Inspection Modal */}
      {inspectingOfficer && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm overflow-y-auto cursor-pointer"
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectingOfficer(null)}
        >
          <div
            className="relative w-full max-w-4xl my-8 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-4 mb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
                  Training Division · Officer Inspection
                </span>
                <h3 className="text-xl font-bold text-fg mt-0.5">{inspectingOfficer.name}</h3>
                <p className="text-xs text-fg-muted">
                  {inspectingOfficer.designation} · {inspectingOfficer.division} · iGOT ID: {inspectingOfficer.igotUserId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOfficer(null)}
                className="rounded-lg p-1.5 text-fg-muted hover:bg-slate-100 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <CompetencyRadarCard
                officerName={inspectingOfficer.name}
                cadreRank={inspectingOfficer.cadreRank}
                data={officerProficiencies[inspectingOfficer.id] || []}
              />
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Button onClick={() => setInspectingOfficer(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
