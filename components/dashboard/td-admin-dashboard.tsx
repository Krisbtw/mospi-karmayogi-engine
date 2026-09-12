"use client";

import { useState } from "react";
import { Send, Check, TrendingUp, TrendingDown, Users, BookOpen, Award, AlertTriangle, Zap, Globe, BarChart3, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { TD_CADRE_HEATMAP_DATA } from "@/lib/data-service";
import { COHORT_EFFECTIVENESS_SUMMARY, COMPETENCY_EFFECTIVENESS_AGGREGATE } from "@/lib/training-effectiveness";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOTAL_OFFICERS = TD_CADRE_HEATMAP_DATA.reduce((sum, d) => sum + d.totalOfficers, 0);

// Top skill gaps across cadre
const TOP_SKILL_GAPS = [
  { skill: "R/Python for Survey Data Processing", fracCode: "FN-STAT-033", gapPct: 71, priority: "Critical",  category: "Technical" },
  { skill: "Data Visualization & Dashboarding",   fracCode: "TC-DATAVIZ-001", gapPct: 66, priority: "Critical",  category: "Technical" },
  { skill: "GIS & Geospatial Analysis",           fracCode: "TC-GIS-001",    gapPct: 59, priority: "Critical",  category: "Technical" },
  { skill: "SQL & Database Management",            fracCode: "TC-SQL-001",    gapPct: 52, priority: "High",      category: "Technical" },
  { skill: "Survey Sampling Design",               fracCode: "FN-STAT-014",   gapPct: 47, priority: "High",      category: "Statistical" },
  { skill: "National Income Accounting",           fracCode: "FN-STAT-021",   gapPct: 44, priority: "High",      category: "Statistical" },
  { skill: "Price Statistics (CPI/WPI)",           fracCode: "DM-PRICE-002",  gapPct: 39, priority: "Moderate",  category: "Statistical" },
  { skill: "e-Governance & Digital India",         fracCode: "DG-EGOV-001",   gapPct: 34, priority: "Moderate",  category: "Digital Gov" },
  { skill: "Leadership & Team Coordination",       fracCode: "BH-LEAD-001",   gapPct: 28, priority: "Moderate",  category: "Behavioural" },
  { skill: "Communication & Report Writing",       fracCode: "BH-COMM-001",   gapPct: 14, priority: "Low",       category: "Behavioural" },
];

// Competency distribution across cadre (% of officers reaching proficiency)
const COMPETENCY_DIST = [
  { category: "Statistical",       proficientPct: 63, totalCompetencies: 4, avgGap: 1.4 },
  { category: "Technical",         proficientPct: 38, totalCompetencies: 4, avgGap: 2.1 },
  { category: "Digital Governance",proficientPct: 41, totalCompetencies: 1, avgGap: 1.8 },
  { category: "Behavioural",       proficientPct: 72, totalCompetencies: 3, avgGap: 0.9 },
];

// Future skills
const FUTURE_SKILLS = [
  { title: "AI/ML for Official Statistics", readiness: 18, trend: "up",   urgency: "Emerging", icon: "🤖", desc: "Machine learning for census imputation, anomaly detection, and automated data quality flagging." },
  { title: "Big Data & Admin Data Integration", readiness: 24, trend: "up", urgency: "Emerging", icon: "📊", desc: "Integration of GST, EPFO, and administrative databases with traditional survey frameworks." },
  { title: "SDG Indicator Monitoring & Reporting", readiness: 52, trend: "up", urgency: "Developing", icon: "🌐", desc: "Compilation and tracking of India-specific SDG indicators aligned to UN 2030 Agenda." },
  { title: "Privacy-Preserving Statistical Methods", readiness: 29, trend: "up", urgency: "Emerging", icon: "🔒", desc: "Differential privacy and synthetic data techniques for public microdata release." },
];

const PRIORITY_STYLE: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-300",
  High:     "bg-amber-100 text-amber-700 border-amber-300",
  Moderate: "bg-sky-100 text-sky-700 border-sky-300",
  Low:      "bg-emerald-100 text-emerald-700 border-emerald-300",
};

export function TdAdminDashboard() {
  const [dispatched, setDispatched] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);

  const handleDispatchBatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  const displayedGaps = showAllGaps ? TOP_SKILL_GAPS : TOP_SKILL_GAPS.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">

      {/* ── A. Workforce Overview KPIs ──────────────────────────────── */}
      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">Workforce Overview</p>
          <h2 className="text-xl font-bold tracking-tight text-fg">Cadre Workforce Analytics</h2>
          <p className="text-xs text-fg-muted mt-0.5">Real-time FRAC assessment coverage and training participation across MoSPI operational divisions.</p>
        </div>

        {/* Wide dominant cell + narrow KPIs */}
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col justify-between gap-8 border-b border-border p-7 sm:col-span-2 lg:col-span-1 lg:border-b-0 lg:border-r">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Primary Skill Deficit · FOD & ESD Cadres</p>
              <p className="mt-1 text-sm text-fg-muted">Largest cross-divisional competency gap by percentage</p>
            </div>
            <div>
              <p className="text-4xl font-semibold leading-none tracking-tight text-fg text-balance">R/Python for survey microdata</p>
              <p className="mt-3 text-sm text-fg-muted">
                <span className="font-mono font-medium text-amber-700">71%</span> average deficit against the FRAC baseline
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border-b border-border p-6 sm:border-r lg:border-b-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Officers Monitored</p>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-data text-3xl font-semibold leading-none tracking-tight text-fg">{TOTAL_OFFICERS.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">4 divisions · JSO, SO and DD ranks</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border-b border-border p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">iGOT Enrolment Rate</p>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-data text-3xl font-semibold leading-none tracking-tight text-emerald-700">83.7%</p>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">{Math.round(TOTAL_OFFICERS * 0.837).toLocaleString("en-IN")} officers with active Sunbird course</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Median FRAC Gain</p>
              <TrendingUp className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <p className="font-data text-3xl font-semibold leading-none tracking-tight text-sky-700">+1.3 lvl</p>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">Post-training assessment gain (cadre-wide)</p>
            </div>
          </div>
        </div>

        {/* Extended KPI row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Officers Assessed",   value: `${Math.round(TOTAL_OFFICERS * 0.857).toLocaleString("en-IN")}`, sub: "85.7% coverage", color: "text-fg" },
            { label: "Officers Trained",    value: `${Math.round(TOTAL_OFFICERS * 0.731).toLocaleString("en-IN")}`, sub: "73.1% participation", color: "text-fg" },
            { label: "Avg. Competency Level", value: "3.2 / 5", sub: "Across all 12 FRAC codes", color: "text-fg" },
            { label: "Avg. Skill Gap",      value: "1.4 lvl", sub: "Per officer vs. target", color: "text-amber-700" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{k.label}</p>
              <p className={`mt-2 text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="mt-1 text-[11px] text-fg-muted">{k.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── B. Competency Distribution ────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">Competency Distribution</p>
          <h2 className="text-xl font-bold tracking-tight text-fg">FRAC Competency Proficiency Distribution</h2>
          <p className="text-xs text-fg-muted mt-0.5">Percentage of cadre meeting or exceeding target level per competency category.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {COMPETENCY_DIST.map((cat) => {
                const isGood = cat.proficientPct >= 60;
                const isMed  = cat.proficientPct >= 40 && !isGood;
                const barColor = isGood ? "#16a34a" : isMed ? "#d97706" : "#dc2626";
                return (
                  <div key={cat.category} className="flex flex-col gap-3 rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-fg">{cat.category}</p>
                      <span className={`text-[11px] font-mono font-bold ${isGood ? "text-emerald-700" : isMed ? "text-amber-700" : "text-red-700"}`}>
                        {cat.proficientPct}% proficient
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-bg overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.proficientPct}%`, backgroundColor: barColor }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-fg-muted">
                      <span>{cat.totalCompetencies} competenc{cat.totalCompetencies > 1 ? "ies" : "y"} tracked</span>
                      <span>Avg gap: <strong className="text-fg">{cat.avgGap} lvl</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── C. Top Skill Gaps ─────────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">Skill Gap Analysis</p>
          <h2 className="text-xl font-bold tracking-tight text-fg">Top Skill Gaps — Ranked by Severity</h2>
          <p className="text-xs text-fg-muted mt-0.5">Competencies where cadre proficiency falls furthest below FRAC-mandated targets.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[580px]">
                <thead>
                  <tr className="border-b border-border bg-slate-50/80 text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                    <th className="py-3 px-4 font-semibold text-fg">Competency / Skill</th>
                    <th className="py-3 px-4 font-semibold">FRAC Code</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Gap %</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedGaps.map((row) => (
                    <tr key={row.fracCode} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-fg">{row.skill}</td>
                      <td className="py-3 px-4 font-mono text-fg-muted">{row.fracCode}</td>
                      <td className="py-3 px-4 text-fg-muted">{row.category}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-bg overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${row.gapPct}%`,
                              backgroundColor: row.gapPct >= 60 ? "#dc2626" : row.gapPct >= 40 ? "#d97706" : "#2563eb"
                            }} />
                          </div>
                          <span className={`font-mono font-bold ${row.gapPct >= 60 ? "text-red-700" : row.gapPct >= 40 ? "text-amber-700" : "text-sky-700"}`}>
                            {row.gapPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[row.priority]}`}>
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowAllGaps(!showAllGaps)}
              className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              {showAllGaps ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showAllGaps ? "Show fewer" : `Show all ${TOP_SKILL_GAPS.length} skill gaps`}
            </button>
          </CardContent>
        </Card>
      </section>

      {/* ── D. Training Effectiveness ─────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">Training Effectiveness</p>
          <h2 className="text-xl font-bold tracking-tight text-fg">Training Effectiveness — Before vs. After</h2>
          <p className="text-xs text-fg-muted mt-0.5">Average proficiency level change measured pre- and post-training across cohorts.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Cohort summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Training Cohorts</CardTitle>
              <CardDescription>Completion rates and average proficiency gains per cohort.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {COHORT_EFFECTIVENESS_SUMMARY.map((c) => (
                  <div key={c.cohort} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-fg">{c.cohort}</p>
                      <span className="shrink-0 text-[11px] font-mono text-emerald-700 font-bold">+{c.improvement} lvl avg</span>
                    </div>
                    <p className="mt-1 text-[11px] text-fg-muted">{c.participants} participants · {c.completionRate}% completion</p>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-fg-muted">Before: <strong className="text-fg">{c.avgBefore}</strong></span>
                      <span className="text-fg-muted">→</span>
                      <span className="text-fg-muted">After: <strong className="text-emerald-700">{c.avgAfter}</strong></span>
                      <span className="ml-auto text-[10px] text-fg-muted">Top: {c.topGainer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competency-level effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Competency-Level Effectiveness</CardTitle>
              <CardDescription>Avg level improvement per skill after training completion.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {COMPETENCY_EFFECTIVENESS_AGGREGATE.map((r) => (
                  <div key={r.fracCode} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-fg truncate">{r.competencyLabel}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-fg-muted">
                        <span className="font-mono">{r.avgBeforeLevel}</span>
                        <div className="flex-1 h-1 bg-bg rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(r.gain / 2) * 100}%` }} />
                        </div>
                        <span className="font-mono text-emerald-700">{r.avgAfterLevel}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700">+{r.gain}</span>
                      <p className="text-[10px] text-fg-muted">{r.officersTrained} trained</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── E. Future Skills Panel ────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">Future Skills</p>
          <h2 className="text-xl font-bold tracking-tight text-fg">Emerging Competency Requirements</h2>
          <p className="text-xs text-fg-muted mt-0.5">Upcoming statistical capabilities identified for proactive workforce preparation by NSSTA TPAC.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FUTURE_SKILLS.map((fs) => (
            <div key={fs.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{fs.icon}</span>
                <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${fs.urgency === "Emerging" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                  {fs.urgency}
                </span>
              </div>
              <p className="text-sm font-semibold text-fg leading-snug">{fs.title}</p>
              <p className="text-[11px] text-fg-muted leading-relaxed">{fs.desc}</p>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-fg-muted">Cadre Readiness</span>
                  <span className="font-mono font-bold text-fg">{fs.readiness}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${fs.readiness}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── F. Division Deficit Matrix (existing heatmap) ─────────────── */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">Bharat FRAC cadre baselines</p>
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
                <><Check className="h-4 w-4" aria-hidden /><span>Diagnostics dispatched</span></>
              ) : (
                <><Send className="h-4 w-4" aria-hidden /><span>Schedule cadre-wide diagnostic</span></>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {dispatched && (
            <div className="mb-8 flex items-start gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-50 p-3.5 text-xs text-emerald-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
              <span className="text-pretty">
                Notifications sent to {TOTAL_OFFICERS.toLocaleString("en-IN")} officers across the NSSO and CSO regional directorates through the iGOT Karmayogi notification API.
              </span>
            </div>
          )}

          {/* Heatmap table */}
          <div className="mb-10 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-slate-50/70 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-fg">Cadre-Wide Deficit Heatmap Matrix</h4>
                <p className="text-xs text-fg-muted">Divisions (Y-Axis) × FRAC Competencies (X-Axis)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" /> &lt;20% Low</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500/25 border border-amber-500/50" /> 20-50% Moderate</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500/25 border border-red-500/50" /> &gt;50% Critical</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-border bg-slate-100/50 text-[11px] font-mono text-fg-muted uppercase tracking-wider">
                    <th className="p-3.5 pl-5 font-semibold text-fg">Division</th>
                    <th className="p-3.5 font-semibold text-center">Officers</th>
                    <th className="p-3.5 font-semibold">Survey Sampling</th>
                    <th className="p-3.5 font-semibold">Price Indexing</th>
                    <th className="p-3.5 font-semibold">R/Python</th>
                    <th className="p-3.5 font-semibold">Data Ethics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {TD_CADRE_HEATMAP_DATA.map((row) => {
                    const getCompGap = (keyword: string) => {
                      const found = row.competencies.find((c) => c.label.toLowerCase().includes(keyword.toLowerCase()));
                      return found ? found.gapPercent : null;
                    };
                    const renderCell = (gap: number | null) => {
                      if (gap === null) return <span className="text-slate-300 font-mono">—</span>;
                      const isHigh = gap >= 50;
                      const isMod = gap >= 20 && gap < 50;
                      return (
                        <div className={cn(
                          "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold transition-all hover:scale-105 shadow-sm",
                          isHigh ? "bg-red-500/15 text-red-700 border border-red-500/30" : isMod ? "bg-amber-500/15 text-amber-700 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                        )}>
                          {gap}%
                        </div>
                      );
                    };
                    return (
                      <tr key={row.division} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 pl-5 font-medium text-fg">
                          <span className="text-sm font-semibold">{row.division}</span>
                          <span className="block text-[11px] text-fg-muted font-normal">{row.cadreBreakdown}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-semibold text-fg">{row.totalOfficers}</td>
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

          {/* Division bars */}
          <div className="flex flex-col divide-y divide-border">
            {TD_CADRE_HEATMAP_DATA.map((division, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div key={division.division} className={cn("grid grid-cols-1 gap-6 py-8 first:pt-0 last:pb-0 lg:grid-cols-12 lg:gap-10")}>
                  <div className={cn("flex flex-col justify-between gap-4 lg:col-span-4", reversed && "lg:order-2 lg:col-start-9")}>
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight text-fg text-balance">{division.division}</h4>
                      <p className="mt-1 text-xs text-fg-muted">{division.cadreBreakdown}</p>
                    </div>
                    <p className="font-data text-2xl font-semibold text-fg">
                      {division.totalOfficers}<span className="ml-1.5 font-sans text-xs font-normal text-fg-muted">officers</span>
                    </p>
                  </div>
                  <div className={cn("flex flex-col gap-4 lg:col-span-8", reversed && "lg:order-1 lg:col-start-1")}>
                    {division.competencies.map((comp) => {
                      const isCritical = comp.gapPercent >= 60;
                      const isModerate = comp.gapPercent >= 35 && comp.gapPercent < 60;
                      return (
                        <div key={comp.code} className="flex flex-col gap-1.5">
                          <div className="flex items-baseline justify-between gap-4 text-xs">
                            <span className="truncate font-medium text-fg-muted">{comp.label}</span>
                            <span className={cn("shrink-0 font-mono tabular-nums", isCritical ? "text-red-700" : isModerate ? "text-amber-700" : "text-emerald-700")}>
                              {comp.gapPercent}% below baseline
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                            <div
                              className={cn("h-full rounded-full transition-[width] duration-700 ease-out", isCritical ? "bg-red-600" : isModerate ? "bg-primary" : "bg-emerald-600")}
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
