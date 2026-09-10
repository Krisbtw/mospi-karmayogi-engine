"use client";

import { Check, ChevronDown, FileUp, ListChecks, FlaskConical } from "lucide-react";
import { Officer, DEMO_OFFICERS, CompetencyItem } from "@/lib/data-service";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CadreProfileBarProps {
  currentOfficer: Officer;
  onSelectOfficer: (officer: Officer) => void;
  competencies: CompetencyItem[];
  activeView: "OFFICER" | "TD_ADMIN";
  onChangeView: (view: "OFFICER" | "TD_ADMIN") => void;
  onOpenQuizGenerator: () => void;
  onOpenDocUpload: () => void;
}

export function CadreProfileBar({ currentOfficer, onSelectOfficer, competencies, activeView, onChangeView, onOpenQuizGenerator, onOpenDocUpload }: CadreProfileBarProps) {
  const activeGaps = competencies.filter((c) => c.current < c.target);
  const metCount = competencies.filter((c) => c.current >= c.target).length;
  const complianceRate = Math.round((metCount / (competencies.length || 1)) * 100);

  return (
    <div className="workspace-heading">
      <div><h1>{activeView === "OFFICER" ? "Your next step, made clear." : "Build a stronger statistical workforce."}</h1><p>{activeView === "OFFICER" ? "Build skills for better statistical decisions." : "A clear view of cadre readiness and learning priorities."}</p></div>
      <div className="workspace-context">
        <span className="demo-badge"><FlaskConical aria-hidden="true" />Demo workspace</span>
        <DropdownMenu>
          <DropdownMenuTrigger id="officer-switcher" className="role-switcher" aria-label="Switch officer or workspace view"><span>Role: <strong>{activeView === "OFFICER" ? currentOfficer.cadreRank : "T&D"}</strong></span><ChevronDown aria-hidden="true" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Demo cadre profiles</DropdownMenuLabel>
            {DEMO_OFFICERS.map((officer) => <DropdownMenuItem key={officer.id} onSelect={() => onSelectOfficer(officer)} className="items-start gap-2 py-2"><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="font-medium text-fg">{officer.name} <span className="text-xs text-fg-muted">· {officer.cadreRank}</span></span><span className="text-[11px] text-fg-muted">{officer.designation}</span></span>{currentOfficer.id === officer.id && <Check className="mt-1 h-4 w-4 text-primary" />}</DropdownMenuItem>)}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Workspace view</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onChangeView("OFFICER")}>Cadre officer view {activeView === "OFFICER" && <Check className="ml-auto h-4 w-4 text-primary" />}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onChangeView("TD_ADMIN")}>Training division view {activeView === "TD_ADMIN" && <Check className="ml-auto h-4 w-4 text-primary" />}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className="px-2 py-2 text-[11px] leading-relaxed text-fg-muted">{competencies.length} competencies · {activeGaps.length} open gaps<br />{complianceRate}% FRAC compliance</p>
            <DropdownMenuItem onSelect={onOpenDocUpload}><FileUp className="mr-2 h-4 w-4" />Upload handbook</DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenQuizGenerator}><ListChecks className="mr-2 h-4 w-4" />Generate diagnostic quiz</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
