"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, Check, BookOpen, ArrowRight } from "lucide-react";
import { IgotCourse } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseRecommendationsListProps {
  userId: string;
  recommendations: IgotCourse[];
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
  recommendations,
  onSynced,
  onCourseCompleted,
  onReassessCompetency,
  className,
}: CourseRecommendationsListProps) {
  const [items, setItems] = useState<IgotCourse[]>(recommendations);
  const [showAll, setShowAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(recommendations);
  }, [recommendations]);

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

      <ol id="recommended-courses" className={cn("course-list", showAll && "is-expanded")} aria-label="Recommended courses">
        {items.map((rec) => {
          const isDone = rec.status === "COMPLETED";
          const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
          const isSyncing = syncingId === rec.id;

          return (
            <li
              key={rec.id}
              className="course-item"
            >
              <details className="course-disclosure">
              <summary className="course-summary">
                <span className="course-icon"><BookOpen aria-hidden="true" /></span>
                <span className="course-preview"><strong>{rec.courseTitle}</strong><span>{isDone ? "Certified" : "Learning"} <i>·</i> {rec.durationHours} h</span></span>
                <span className="course-open"><ArrowRight aria-hidden="true" /></span>
              </summary>
              <div className="course-detail">
              <div className="min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium leading-snug text-balance",
                    isDone ? "text-fg-muted line-through decoration-slate-400" : "text-fg"
                  )}
                >
                  {rec.courseTitle}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted text-pretty">
                  Resolves <span className="font-medium text-fg">{rec.competencyLabel}</span>
                  <span className="text-fg-muted"> · </span>
                  <span className="font-mono">{Math.round(rec.matchScore * 100)}% match</span>
                  <span className="text-fg-muted"> · </span>
                  <span className="font-mono">{rec.durationHours} h</span>
                  <span className="text-fg-muted"> · </span>
                  {rec.provider}
                </p>
              </div>

              {/* Actions — bottom/right aligned as a unit */}
              <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1">
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.12em]",
                    isDone ? "text-emerald-700" : isEnrolled ? "text-primary" : "text-fg-muted"
                  )}
                >
                  {STATUS_LABEL[rec.status]}
                </span>

                {rec.courseUrl && (
                  <Button variant="ghost" size="icon-sm" asChild className="h-7 w-7 text-fg-muted hover:text-fg" title="Open iGOT Karmayogi Bharat portal">
                    <a href={rec.courseUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${rec.courseTitle} on iGOT Karmayogi`}>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                )}

                {!isDone && !isEnrolled && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSyncing}
                    onClick={() => handleSync(rec)}
                    className="h-7 gap-1.5 px-2.5 text-xs"
                  >
                    <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} aria-hidden />
                    <span>{isSyncing ? "Enrolling…" : "Enrol"}</span>
                  </Button>
                )}

                {isEnrolled && !isDone && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSimulateComplete(rec)}
                    className="h-7 gap-1.5 px-2.5 text-xs"
                  >
                    <Check className="h-3 w-3" aria-hidden />
                    <span>Mark complete</span>
                  </Button>
                )}

                {isDone && onReassessCompetency && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReassessCompetency(rec.competencyFracCode)}
                    className="h-7 gap-1.5 border-sky-500/40 bg-sky-500/10 text-primary hover:bg-sky-500/25 hover:text-fg px-2.5 text-xs font-medium"
                    title={`Take diagnostic re-assessment for ${rec.competencyLabel}`}
                  >
                    <RefreshCw className="h-3 w-3 text-primary" aria-hidden />
                    <span>Re-assess</span>
                  </Button>
                )}
              </div>
              </div>
              </details>
            </li>
          );
        })}
      </ol>
      <div className="course-list-footer"><span>{items.filter((item) => item.status === "COMPLETED").length}/{items.length} certified</span><button onClick={() => setShowAll(!showAll)} aria-expanded={showAll} aria-controls="recommended-courses">{showAll ? "Show fewer courses" : `View all ${items.length} courses`} <span aria-hidden="true">→</span></button></div>
    </Card>
  );
}
