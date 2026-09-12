"use client";

import React from "react";
import { BarChart3, TrendingUp, Award, Users, CheckCircle2, BookOpen, AlertTriangle } from "lucide-react";
import { TD_CADRE_HEATMAP_DATA } from "@/lib/data-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function AdminAnalyticsView() {
  const TOTAL_OFFICERS = TD_CADRE_HEATMAP_DATA.reduce((sum, d) => sum + d.totalOfficers, 0);

  const divisionPerformance = [
    { division: "Field Operations Division (FOD)", officers: 6240, enrolled: "86%", completed: "68%", passRate: "72%", priority: "Survey Sampling Design" },
    { division: "National Accounts Division (NAD)", officers: 2180, enrolled: "91%", completed: "74%", passRate: "81%", priority: "National Income Accounting" },
    { division: "Economic Statistics Division (ESD)", officers: 2420, enrolled: "82%", completed: "61%", passRate: "69%", priority: "Price Statistics (CPI/WPI)" },
    { division: "Data Quality Assurance (DQAD)", officers: 1640, enrolled: "79%", completed: "59%", passRate: "76%", priority: "R/Python for Microdata" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
            Institutional Oversight
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-fg mt-0.5">
          Cadre Learning Analytics & Training Effectiveness
        </h2>
        <p className="text-xs text-fg-muted mt-1">
          Telemetry on iGOT course completions, FRAC benchmark progression velocity, and diagnostic examination pass rates.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Officers Monitored</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-fg">{TOTAL_OFFICERS.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-[11px] text-fg-muted">Across 4 national operational wings</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">iGOT Enrolment</span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">83.7%</p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">↑ +4.2% month-over-month</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Median FRAC Gain</span>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-700">+1.3 lvl</p>
          <p className="mt-1 text-[11px] text-fg-muted">Post-curriculum assessment gain</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Diagnostic Pass Rate</span>
            <Award className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">74.5%</p>
          <p className="mt-1 text-[11px] text-fg-muted">Passing threshold: ≥60% score</p>
        </div>
      </div>

      {/* Divisional Training Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Divisional Training & Certification Ledger</CardTitle>
          <CardDescription>
            Enrolment, course completion, and diagnostic pass rates mapped across directorates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px] text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                  <th className="py-3 px-4 font-semibold text-fg">Division</th>
                  <th className="py-3 px-4 font-semibold">Cadre Strength</th>
                  <th className="py-3 px-4 font-semibold">Enrolment</th>
                  <th className="py-3 px-4 font-semibold">Certification</th>
                  <th className="py-3 px-4 font-semibold">Pass Rate</th>
                  <th className="py-3 px-4 font-semibold">Primary Target Skill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {divisionPerformance.map((row) => (
                  <tr key={row.division} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-semibold text-fg">{row.division}</td>
                    <td className="py-3 px-4 font-mono text-fg">{row.officers.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 font-mono text-primary font-medium">{row.enrolled}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-medium">{row.completed}</td>
                    <td className="py-3 px-4 font-mono text-fg">{row.passRate}</td>
                    <td className="py-3 px-4 text-fg-muted">{row.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
