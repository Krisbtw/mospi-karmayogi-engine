"use client";

import {
  UserCircle2,
  ShieldCheck,
  BrainCircuit,
  FileUp,
  BarChart3,
  AlertTriangle,
  Award,
  Layers,
} from "lucide-react";
import { Officer, DEMO_OFFICERS, CompetencyItem } from "@/lib/data-service";

interface CadreProfileBarProps {
  currentOfficer: Officer;
  onSelectOfficer: (officer: Officer) => void;
  competencies: CompetencyItem[];
  activeView: "OFFICER" | "TD_ADMIN";
  onChangeView: (view: "OFFICER" | "TD_ADMIN") => void;
  onOpenQuizGenerator: () => void;
  onOpenDocUpload: () => void;
}

export function CadreProfileBar({
  currentOfficer,
  onSelectOfficer,
  competencies,
  activeView,
  onChangeView,
  onOpenQuizGenerator,
  onOpenDocUpload,
}: CadreProfileBarProps) {
  const activeGaps = competencies.filter((c) => c.current < c.target);
  const metCount = competencies.filter((c) => c.current >= c.target).length;
  const complianceRate = Math.round((metCount / competencies.length) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Officer info & switcher */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 font-bold text-white shadow-lg">
            {currentOfficer.avatar}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {currentOfficer.name}
              </h2>
              <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                {currentOfficer.cadreRank} · {currentOfficer.designation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentOfficer.division} · {currentOfficer.region} · iGOT ID: {currentOfficer.igotUserId}
            </p>
          </div>
        </div>

        {/* View Switcher: Officer vs TD Admin */}
        <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/80 p-1 self-start lg:self-center">
          <button
            type="button"
            onClick={() => onChangeView("OFFICER")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeView === "OFFICER"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCircle2 className="h-3.5 w-3.5" />
            <span>Cadre Officer View</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeView("TD_ADMIN")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeView === "TD_ADMIN"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Training Division (TD) View</span>
          </button>
        </div>

        {/* Actions & Officer select */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick officer selector */}
          <select
            value={currentOfficer.id}
            onChange={(e) => {
              const o = DEMO_OFFICERS.find((item) => item.id === e.target.value);
              if (o) onSelectOfficer(o);
            }}
            className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
          >
            {DEMO_OFFICERS.map((o) => (
              <option key={o.id} value={o.id}>
                Switch Officer: {o.name} ({o.cadreRank} - {o.division.split(" ")[0]})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenDocUpload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950/70 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors shadow-sm"
          >
            <FileUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Upload Handbook</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuizGenerator}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition-all shadow-md"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Generate AI Quiz</span>
          </button>
        </div>
      </div>

      {/* Metric summary strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Competencies Mapped</p>
            <p className="font-semibold text-white">{competencies.length} FRAC Codes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Active Skill Gaps</p>
            <p className="font-semibold text-amber-400">{activeGaps.length} Identified Deficits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">FRAC Baseline Compliance</p>
            <p className="font-semibold text-emerald-400">{complianceRate}% Target Met</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Cadre Rank Standard</p>
            <p className="font-semibold text-white">{currentOfficer.cadreRank} Baseline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
