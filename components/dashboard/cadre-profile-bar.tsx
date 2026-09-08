"use client";

import {
  UserCircle2,
  BrainCircuit,
  FileUp,
  BarChart3,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { Officer, DEMO_OFFICERS, CompetencyItem } from "@/lib/data-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm mb-8">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Officer info */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-sky-400 font-semibold font-mono text-sm shadow-sm">
              {currentOfficer.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  {currentOfficer.name}
                </h2>
                <Badge variant="outline" className="font-mono text-xs text-sky-300 border-sky-500/30">
                  {currentOfficer.cadreRank} · {currentOfficer.designation}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentOfficer.division} · {currentOfficer.region} · iGOT ID:{" "}
                <span className="font-mono text-slate-300">{currentOfficer.igotUserId}</span>
              </p>
            </div>
          </div>

          {/* View Switcher using Shadcn Tabs */}
          <div className="self-start lg:self-center">
            <Tabs
              value={activeView}
              onValueChange={(val) => onChangeView(val as "OFFICER" | "TD_ADMIN")}
            >
              <TabsList className="bg-slate-950 border border-slate-800">
                <TabsTrigger value="OFFICER" className="gap-1.5 text-xs">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  <span>Cadre Officer View</span>
                </TabsTrigger>
                <TabsTrigger value="TD_ADMIN" className="gap-1.5 text-xs">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Training Division (TD) View</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Actions & Officer selector */}
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-normal">
                  <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span className="max-w-[130px] truncate">{currentOfficer.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs">Select Cadre Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DEMO_OFFICERS.map((o) => (
                  <DropdownMenuItem
                    key={o.id}
                    onClick={() => onSelectOfficer(o)}
                    className="flex flex-col items-start gap-0.5 py-1.5 cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-white">{o.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {o.cadreRank}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {o.designation} · {o.division.split(" ")[0]}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDocUpload}
              className="h-8 gap-1.5 text-xs"
            >
              <FileUp className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload Handbook</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onOpenQuizGenerator}
              className="h-8 gap-1.5 text-xs"
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>Generate AI Quiz</span>
            </Button>
          </div>
        </div>

        {/* High-density metadata telemetry strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Competencies: <strong className="text-white font-mono">{competencies.length}</strong>
            </span>
            <span className="text-slate-700">·</span>
            <span>
              Active Gaps:{" "}
              <strong className={activeGaps.length > 0 ? "text-amber-400 font-mono" : "text-emerald-400 font-mono"}>
                {activeGaps.length} Deficits
              </strong>
            </span>
            <span className="text-slate-700">·</span>
            <span>
              FRAC Compliance: <strong className="text-emerald-400 font-mono">{complianceRate}%</strong>
            </span>
            <span className="text-slate-700">·</span>
            <span>
              Cadre Baseline: <strong className="text-slate-200">{currentOfficer.cadreRank}</strong>
            </span>
          </div>

          <span className="font-mono text-slate-500 text-xs hidden sm:inline">
            MoSPI Bharat FRAC Registry
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
