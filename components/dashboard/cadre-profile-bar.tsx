"use client";

import { Check, ChevronDown, FileUp, ListChecks, FlaskConical, User, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { Officer, DEMO_OFFICERS, CompetencyItem } from "@/lib/data-service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SlidingTabs, SlidingTabOption } from "@/components/ui/sliding-tabs";
import { CircularGauge } from "@/components/ui/circular-gauge";

interface CadreProfileBarProps {
  currentOfficer: Officer;
  onSelectOfficer: (officer: Officer) => void;
  competencies: CompetencyItem[];
  activeView: "OFFICER" | "TD_ADMIN";
  onChangeView: (view: "OFFICER" | "TD_ADMIN") => void;
  onOpenQuizGenerator: () => void;
  onOpenDocUpload: () => void;
}

const VIEW_OPTIONS: SlidingTabOption<"OFFICER" | "TD_ADMIN">[] = [
  {
    id: "OFFICER",
    label: "Cadre Officer View",
    icon: <User className="h-3.5 w-3.5" />,
  },
  {
    id: "TD_ADMIN",
    label: "Training Division Admin",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
];

export function CadreProfileBar({ currentOfficer, onSelectOfficer, competencies, activeView, onChangeView, onOpenQuizGenerator, onOpenDocUpload }: CadreProfileBarProps) {
  const activeGaps = competencies.filter((c) => c.current < c.target);
  const metCount = competencies.filter((c) => c.current >= c.target).length;
  const complianceRate = Math.round((metCount / (competencies.length || 1)) * 100);

  return (
    <div className="workspace-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1>{activeView === "OFFICER" ? "Your next step, made clear." : "Build a stronger statistical workforce."}</h1>
        <p>{activeView === "OFFICER" ? "Build skills for better statistical decisions." : "A clear view of cadre readiness and learning priorities."}</p>
      </div>

      <div className="workspace-context flex flex-wrap items-center gap-3">
        {/* Live Circular FRAC Compliance Gauge */}
        {activeView === "OFFICER" && (
          <CircularGauge value={complianceRate} label="FRAC Readiness" />
        )}

        {/* Institutional Quick Action Buttons (Integrated into header) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuizGenerator}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-fg shadow-sm hover:border-primary/50 hover:bg-slate-50 transition-all active:scale-[0.98]"
            title="Launch AI Diagnostic Quiz Studio"
          >
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            <span>Quiz Studio</span>
          </button>
          <button
            type="button"
            onClick={onOpenDocUpload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-fg shadow-sm hover:border-primary/50 hover:bg-slate-50 transition-all active:scale-[0.98]"
            title="Ingest MoSPI Manuals"
          >
            <FileUp className="h-3.5 w-3.5 text-primary" />
            <span>Ingest Manual</span>
          </button>
        </div>

        {/* Modern 21st.dev Animated Sliding Pill Tabs */}
        <SlidingTabs
          options={VIEW_OPTIONS}
          activeId={activeView}
          onChange={onChangeView}
          layoutId="role-switcher-pill"
          className="shadow-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger id="officer-switcher" className="role-switcher" aria-label="Switch officer or workspace view">
            <span>Officer: <strong>{currentOfficer.name.split(" ")[0]} ({currentOfficer.cadreRank})</strong></span>
            <ChevronDown aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Demo cadre profiles</DropdownMenuLabel>
            {DEMO_OFFICERS.map((officer) => (
              <DropdownMenuItem key={officer.id} onSelect={() => onSelectOfficer(officer)} className="items-start gap-2 py-2">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium text-fg">{officer.name} <span className="text-xs text-fg-muted">· {officer.cadreRank}</span></span>
                  <span className="text-[11px] text-fg-muted">{officer.designation}</span>
                </span>
                {currentOfficer.id === officer.id && <Check className="mt-1 h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <p className="px-2 py-2 text-[11px] leading-relaxed text-fg-muted">
              {competencies.length} competencies · {activeGaps.length} open gaps<br />{complianceRate}% FRAC compliance
            </p>
            <DropdownMenuItem onSelect={onOpenDocUpload}>
              <FileUp className="mr-2 h-4 w-4" />Upload handbook
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenQuizGenerator}>
              <ListChecks className="mr-2 h-4 w-4" />Generate diagnostic quiz
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
