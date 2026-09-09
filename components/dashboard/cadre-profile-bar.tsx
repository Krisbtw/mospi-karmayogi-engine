"use client";

import { ChevronDown, FileUp, ListChecks } from "lucide-react";
import { Officer, DEMO_OFFICERS, CompetencyItem } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const complianceRate = Math.round((metCount / (competencies.length || 1)) * 100);

  return (
    <div className="flex flex-col gap-6 border-b border-slate-800 pb-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        {/* Officer identity */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-900 font-mono text-base font-semibold text-amber-400">
            {currentOfficer.avatar}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {currentOfficer.cadreRank} · {currentOfficer.designation}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {currentOfficer.name}
            </h2>
            <p className="text-sm text-slate-400">
              {currentOfficer.division} · {currentOfficer.region} · iGOT ID{" "}
              <span className="font-mono text-slate-300">{currentOfficer.igotUserId}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 font-normal">
                <span className="max-w-[140px] truncate">Switch officer</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs">Demo cadre profiles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEMO_OFFICERS.map((o) => (
                <DropdownMenuItem
                  key={o.id}
                  onClick={() => onSelectOfficer(o)}
                  className="flex flex-col items-start gap-0.5 py-1.5 text-xs"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-white">{o.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{o.cadreRank}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {o.designation} · {o.division.split(" ")[0]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onOpenDocUpload} className="gap-1.5">
            <FileUp className="h-3.5 w-3.5" aria-hidden />
            <span>Upload handbook</span>
          </Button>

          <Button variant="default" size="sm" onClick={onOpenQuizGenerator} className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" aria-hidden />
            <span>Generate diagnostic quiz</span>
          </Button>
        </div>
      </div>

      {/* View switcher + inline telemetry */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeView} onValueChange={(val) => onChangeView(val as "OFFICER" | "TD_ADMIN")}>
          <TabsList>
            <TabsTrigger value="OFFICER">Cadre officer view</TabsTrigger>
            <TabsTrigger value="TD_ADMIN">Training division view</TabsTrigger>
          </TabsList>
        </Tabs>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400">
          <div className="flex items-baseline gap-1.5">
            <dt>Competencies</dt>
            <dd className="font-mono font-medium text-white">{competencies.length}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt>Open gaps</dt>
            <dd className={activeGaps.length > 0 ? "font-mono font-medium text-amber-400" : "font-mono font-medium text-emerald-400"}>
              {activeGaps.length}
            </dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt>FRAC compliance</dt>
            <dd className="font-mono font-medium text-white">{complianceRate}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
