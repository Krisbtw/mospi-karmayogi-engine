"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, Check, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { IgotCourse, Officer, CompetencyItem } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JourneyStepper } from "@/components/ui/journey-stepper";
import { SovereignVerificationTag } from "@/components/ui/sovereign-verification-tag";

interface CourseRecommendationsListProps {
  userId: string;
  officer?: Officer;
  competencies?: CompetencyItem[];
  recommendations: IgotCourse[];
  defaultShowAll?: boolean;
  initialCount?: number;
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
  onReassessCompetency?: (fracCode: string) => void;
  className?: string;
}

const STATUS_LABEL: Record<IgotCourse["status"], string> = {
  RECOMMENDED: "Recommended",
  ENROLLED: "Enrolled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Certified",
};

export function CourseRecommendationsList({
  userId,
  officer,
  competencies = [],
  recommendations,
  defaultShowAll = false,
  initialCount = 2,
  onSynced,
  onCourseCompleted,
  onReassessCompetency,
  className,
}: CourseRecommendationsListProps) {
  const [items, setItems] = useState<IgotCourse[]>(recommendations);
  const [showAll, setShowAll] = useState(defaultShowAll);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState<string | null>(null);
  const [aiRationales, setAiRationales] = useState<Record<string, { personalizedRationale: string; estimatedImpact?: string; provider?: string }>>({});
  const [, startTransition] = useTransition();

  const displayedItems = showAll ? items : items.slice(0, initialCount);

  useEffect(() => {
    setItems(recommendations);
  }, [recommendations]);

  useEffect(() => {
    let isCancelled = false;

    const activeOfficer = officer || {
      id: userId,
      name: "Anjali Sharma",
      email: "a.sharma@mospi.gov.in",
      designation: "Junior Statistical Officer",
      cadreRank: "JSO" as const,
      region: "Maharashtra (West Zone)",
      division: "FOD",
      igotUserId: "igot_usr_99812",
      avatar: "AS",
    };

    async function fetchInsightsSequentially() {
      for (const rec of displayedItems) {
        if (isCancelled) break;
        if (aiRationales[rec.id]) continue;

        const comp = competencies.find((c) => c.fracCode === rec.competencyFracCode) || {
          id: rec.competencyFracCode,
          fracCode: rec.competencyFracCode,
          label: rec.competencyLabel,
          category: "DOMAIN" as const,
          description: rec.competencyLabel,
          current: 2,
          target: 3,
          lastAssessed: "Baseline",
        };

        try {
          const res = await fetch("/api/ai/recommendation-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              officer: activeOfficer,
              course: rec,
              competency: comp,
            }),
          });
          if (res.ok && !isCancelled) {
            const data = await res.json();
            setAiRationales((prev) => ({
              ...prev,
              [rec.id]: {
                personalizedRationale: data.personalizedRationale,
                estimatedImpact: data.estimatedImpact,
                provider: data.provider,
              },
            }));
          }
        } catch {
          // Silently continue
        }

        // Pacing delay (300ms) to ensure requests never burst past LLM rate limits
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    fetchInsightsSequentially();

    return () => {
      isCancelled = true;
    };
  }, [displayedItems.length, officer?.id, competencies.length]);

  async function handleSync(rec: IgotCourse) {
    setSyncingId(rec.id);
    try {
      const res = await fetch("/api/igot/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          recommendationId: rec.id,
          igotCourseId: rec.igotCourseId,
        }),
      });

      let nextStatus: IgotCourse["status"] = "ENROLLED";
      if (res.ok) {
        const data = await res.json();
        if (data.status) nextStatus = data.status;
      }

      startTransition(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === rec.id ? { ...item, status: nextStatus } : item))
        );
      });
      onSynced?.(rec.id, nextStatus);
    } catch {
      startTransition(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === rec.id ? { ...item, status: "ENROLLED" } : item))
        );
      });
      onSynced?.(rec.id, "ENROLLED");
    } finally {
      setSyncingId(null);
    }
  }

  function handleSimulateComplete(rec: IgotCourse) {
    startTransition(() => {
      setItems((prev) =>
        prev.map((item) => (item.id === rec.id ? { ...item, status: "COMPLETED" } : item))
      );
    });
    setCompletedSuccess(rec.courseTitle);
    setTimeout(() => setCompletedSuccess(null), 5000);
    onCourseCompleted?.(rec.competencyFracCode, rec.courseTitle);
  }

  return (
    <Card className={cn("learning-card", className)}>
      <div className="panel-heading"><h2>Your next learning steps</h2><span className="catalogue-badge">Demo catalogue</span></div>
      <AnimatePresence>
        {completedSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-6"
          >
            <div className="mb-4 flex items-start gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-700">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden />
              <span className="text-pretty">
                Certificate recorded for &ldquo;{completedSuccess}&rdquo;. Proficiency moved up one level on the radar.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ol id="recommended-courses" className={cn("course-list grid grid-cols-1 gap-4", showAll && "is-expanded")} aria-label="Recommended courses">
        {displayedItems.map((rec) => {
          const isDone = rec.status === "COMPLETED";
          const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
          const isSyncing = syncingId === rec.id;

          // Compute structured 4-step micro-curriculum journey
          const journeySteps = [
            {
              id: "gap",
              label: "FRAC Gap",
              sublabel: rec.competencyLabel,
              status: "completed" as const,
            },
            {
              id: "module",
              label: "iGOT Course",
              sublabel: `${rec.durationHours}h · ${rec.provider}`,
              status: (isDone ? "completed" : isEnrolled ? "current" : "upcoming") as "completed" | "current" | "upcoming",
            },
            {
              id: "exercise",
              label: "Field Exercise",
              sublabel: "NSSO / MoSPI Practice",
              status: (isDone ? "completed" : "upcoming") as "completed" | "current" | "upcoming",
            },
            {
              id: "reassess",
              label: "Post-Assessment",
              sublabel: isDone ? "Benchmark Validated" : "Diagnostic Re-test",
              status: (isDone ? "completed" : "upcoming") as "completed" | "current" | "upcoming",
            },
          ];

          return (
            <li key={rec.id} className="list-none">
              <div
                className={cn(
                  "rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 shadow-sm",
                  isDone && "bg-slate-50/50 dark:bg-slate-900/40 opacity-90"
                )}
              >
                <div className="flex flex-col gap-4">
                  {/* Top row with Title, Match Score & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-primary",
                        isDone
                          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                          : "border-primary/20 bg-primary/10"
                      )}>
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn("text-sm font-semibold leading-snug", isDone ? "text-fg-muted line-through" : "text-fg")}>
                            {rec.courseTitle}
                          </h4>
                          {isDone ? (
                            <SovereignVerificationTag level="Certified" source="iGOT Bharat API" />
                          ) : (
                            <span className={cn(
                              "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
                              isEnrolled ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-600"
                            )}>
                              {STATUS_LABEL[rec.status]}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-fg-muted flex items-center gap-2 flex-wrap">
                          <span>Resolves <strong className="text-fg">{rec.competencyLabel}</strong></span>
                          <span>·</span>
                          <span className="font-mono text-primary font-medium">{Math.round(rec.matchScore * 100)}% match</span>
                          <span>·</span>
                          <span className="font-mono">{rec.durationHours} hrs</span>
                          <span>·</span>
                          <span>{rec.provider}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      {rec.courseUrl && (
                        <Button variant="ghost" size="icon-sm" asChild className="h-8 w-8 text-fg-muted hover:text-fg" title="Open iGOT Karmayogi Bharat portal">
                          <a href={rec.courseUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${rec.courseTitle} on iGOT Karmayogi`}>
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        </Button>
                      )}

                      {!isDone && !isEnrolled && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSyncing}
                          onClick={() => handleSync(rec)}
                          className="h-8 gap-1.5 px-3 text-xs border-primary/40 hover:bg-primary/10"
                        >
                          <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} aria-hidden />
                          <span>{isSyncing ? "Enrolling…" : "Enrol via iGOT"}</span>
                        </Button>
                      )}

                      {isEnrolled && !isDone && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSimulateComplete(rec)}
                          className="h-8 gap-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-3 w-3" aria-hidden />
                          <span>Mark completed</span>
                        </Button>
                      )}

                      {isDone && onReassessCompetency && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReassessCompetency(rec.competencyFracCode)}
                          className="h-8 gap-1.5 border-sky-500/40 bg-sky-500/10 text-primary hover:bg-sky-500/25 px-3 text-xs font-medium"
                          title={`Take diagnostic re-assessment for ${rec.competencyLabel}`}
                        >
                          <RefreshCw className="h-3 w-3 text-primary" aria-hidden />
                          <span>Re-test FRAC</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* AI Personalized Learning Recommendation Rationale */}
                  {aiRationales[rec.id] && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px] mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>AI Learning Recommendation Rationale</span>
                        <span className="text-[10px] text-fg-muted font-mono ml-auto">
                          {aiRationales[rec.id].provider}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-fg">
                        {aiRationales[rec.id].personalizedRationale}
                      </p>
                      {aiRationales[rec.id].estimatedImpact && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          <span>{aiRationales[rec.id].estimatedImpact}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* iGOT Micro-Curriculum Stepper / Journey Rail */}
                  <div className="border-t border-border/80 pt-3">
                    <JourneyStepper steps={journeySteps} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="course-list-footer">
        <span>
          {items.filter((item) => item.status === "COMPLETED").length}/{items.length} certified
        </span>
        {items.length > initialCount && (
          <button
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            aria-controls="recommended-courses"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {showAll
              ? "Show fewer courses"
              : `Show more courses (${items.length - initialCount} more)`}
            <span aria-hidden="true">{showAll ? "↑" : "↓"}</span>
          </button>
        )}
      </div>
    </Card>
  );
}
