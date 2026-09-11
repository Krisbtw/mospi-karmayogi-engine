"use client";

import { useEffect, useState } from "react";
import { CompetencyItem, Officer } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Target, BookOpen, ArrowRight, Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CompetencyAnalysisResult } from "@/lib/llm-service";

interface GapAnalysisViewProps {
  officer?: Officer;
  competencies: CompetencyItem[];
  officerName: string;
  cadreRank: string;
  onTakeQuiz: (fracCode: string) => void;
  onTakeAnotherQuiz?: () => void;
  onGoToLearningPath?: () => void;
}

const PROFICIENCY_MAX = 5;

function getPriority(gap: number, target: number): { label: string; color: string; order: number } {
  if (gap <= 0) return { label: "Complete", color: "text-emerald-700 bg-emerald-50 border-emerald-200", order: 4 };
  const ratio = gap / target;
  if (ratio >= 0.5) return { label: "Critical", color: "text-red-700 bg-red-50 border-red-200", order: 1 };
  if (ratio >= 0.3) return { label: "High", color: "text-amber-700 bg-amber-50 border-amber-200", order: 2 };
  return { label: "Medium", color: "text-sky-700 bg-sky-50 border-sky-200", order: 3 };
}

export function GapAnalysisView({
  officer,
  competencies,
  officerName,
  cadreRank,
  onTakeQuiz,
  onTakeAnotherQuiz,
  onGoToLearningPath,
}: GapAnalysisViewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<CompetencyAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const analyzed = competencies
    .map((c) => {
      const gap = c.target - c.current;
      const priority = getPriority(gap, c.target);
      return { ...c, gap, priority };
    })
    .sort((a, b) => a.priority.order - b.priority.order || b.gap - a.gap);

  const totalGap = analyzed.reduce((sum, c) => sum + Math.max(c.gap, 0), 0);
  const met = analyzed.filter((c) => c.gap <= 0).length;
  const overallPercent = Math.round((met / (analyzed.length || 1)) * 100);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const effectiveOfficer = officer || {
        id: "officer_active",
        name: officerName,
        email: "officer@mospi.gov.in",
        designation: cadreRank === "JSO" ? "Junior Statistical Officer" : cadreRank === "SO" ? "Senior Statistical Officer" : "Deputy Director",
        cadreRank: (cadreRank as any) || "JSO",
        region: "MoSPI Cadre Zone",
        division: "Statistical Operations",
        igotUserId: "igot_active",
        avatar: officerName.slice(0, 2).toUpperCase(),
      };

      const res = await fetch("/api/ai/competency-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer: effectiveOfficer,
          competencies,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.warn("Failed to fetch AI competency analysis:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiAnalysis();
  }, [officerName, cadreRank, competencies]);

  return (
    <div className="gap-analysis-view">
      <div className="gap-analysis-header">
        <div>
          <h2>Competency Gap Analysis</h2>
          <p>
            {officerName} · {cadreRank} Cadre Baseline
          </p>
        </div>
        <div className="gap-summary-badges">
          <span className="gap-badge gap-badge-primary">
            {met}/{analyzed.length} on target
          </span>
          <span className="gap-badge gap-badge-neutral">
            {overallPercent}% FRAC compliance
          </span>
          <span className="gap-badge gap-badge-warn">
            {totalGap} levels total gap
          </span>
        </div>
      </div>

      <div className="gap-table-wrapper">
        <table className="gap-table">
          <thead>
            <tr>
              <th>Competency</th>
              <th>FRAC Code</th>
              <th>Required</th>
              <th>Current</th>
              <th>Gap</th>
              <th>Priority</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {analyzed.map((item) => (
              <tr key={item.fracCode} className={item.gap <= 0 ? "row-complete" : ""}>
                <td className="gap-competency-name">
                  <span className="gap-label">{item.label}</span>
                  <span className="gap-desc">{item.description}</span>
                </td>
                <td className="gap-code">{item.fracCode}</td>
                <td className="gap-num">{item.target}/{PROFICIENCY_MAX}</td>
                <td className="gap-num">{item.current}/{PROFICIENCY_MAX}</td>
                <td className="gap-num">
                  {item.gap > 0 ? (
                    <span className="gap-deficit">−{item.gap}</span>
                  ) : (
                    <span className="gap-met">✓</span>
                  )}
                </td>
                <td>
                  <span className={cn("gap-priority-badge", item.priority.color)}>
                    {item.priority.label}
                  </span>
                </td>
                <td>
                  <div className="gap-progress-track">
                    <div
                      className={cn(
                        "gap-progress-fill",
                        item.gap <= 0 ? "bg-emerald-500" : item.priority.order === 1 ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${(item.current / PROFICIENCY_MAX) * 100}%` }}
                    />
                    <div
                      className="gap-progress-target"
                      style={{ left: `${(item.target / PROFICIENCY_MAX) * 100}%` }}
                    />
                  </div>
                </td>
                <td>
                  {item.gap > 0 ? (
                    <button
                      className="gap-action-btn"
                      onClick={() => onTakeQuiz(item.fracCode)}
                    >
                      Take Quiz
                    </button>
                  ) : (
                    <span className="gap-complete-text">Met</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Competency Analysis Card (LLM-Powered) */}
      <div className="gap-ai-summary relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-slate-50 to-teal-50/40 p-5 shadow-sm mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                AI Competency Analysis & Strategic Gaps
              </h3>
              <span className="text-[11px] text-fg-muted font-mono">
                {aiAnalysis?.provider || "MoSPI Grounded Analytical Engine"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAiAnalysis}
            disabled={loadingAi}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-white px-2.5 py-1 text-[11px] font-medium text-fg shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-all"
            title="Re-run live LLM analysis on current competency matrix"
          >
            <RefreshCw className={cn("h-3 w-3", loadingAi && "animate-spin text-primary")} />
            <span>{loadingAi ? "Analyzing…" : "Refresh AI Insights"}</span>
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Executive Insight */}
          <p className="text-fg leading-relaxed text-[13px]">
            {aiAnalysis?.executiveInsight || (
              `${officerName} (${cadreRank}) has ${analyzed.filter((c) => c.priority.order <= 2).length} competencies requiring urgent attention. Overall FRAC compliance is at ${overallPercent}%, with ${totalGap} proficiency levels to close.`
            )}
          </p>

          {/* Detailed Weakness Breakdown */}
          {aiAnalysis?.primaryGap && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900 block">
                  Primary Competency Deficit: {aiAnalysis.primaryGap.label} ({aiAnalysis.primaryGap.fracCode})
                </span>
                <span className="text-amber-800 text-[11px] mt-0.5 block leading-relaxed">
                  <strong>Why it is a gap: </strong>
                  {aiAnalysis.primaryGap.reason}
                </span>
              </div>
            </div>
          )}

          {/* Actionable Focus Areas */}
          {aiAnalysis?.recommendedFocus && aiAnalysis.recommendedFocus.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-fg text-xs block mb-2">
                Recommended Focus Areas for {officerName}:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {aiAnalysis.recommendedFocus.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-md border border-primary/20 bg-white/80 p-2.5 text-[11px] text-fg"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Post-Assessment Action Buttons requested by user */}
      <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
        <button
          type="button"
          onClick={onTakeAnotherQuiz}
          className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-white px-4 py-2.5 text-xs font-medium text-primary hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <Target className="h-4 w-4" />
          <span>Take another quiz</span>
        </button>
        <button
          type="button"
          onClick={onGoToLearningPath}
          className="primary-action inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
        >
          <BookOpen className="h-4 w-4" />
          <span>Go to learning path</span>
          <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
