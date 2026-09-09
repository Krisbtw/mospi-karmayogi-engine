"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, Check } from "lucide-react";
import { IgotCourse } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseRecommendationsListProps {
  userId: string;
  recommendations: IgotCourse[];
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
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
  className,
}: CourseRecommendationsListProps) {
  const [items, setItems] = useState<IgotCourse[]>(recommendations);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useState(() => {
    setItems(recommendations);
  });

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
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex-row items-start justify-between gap-4 pb-4">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Sunbird registry
          </p>
          <CardTitle className="text-lg">iGOT Karmayogi courses</CardTitle>
          <CardDescription>
            Matched to the diagnosed deficits above. Enrolment syncs to the officer&apos;s iGOT record.
          </CardDescription>
        </div>
        <span className="shrink-0 font-mono text-xs text-slate-500">
          {items.filter((i) => i.status === "COMPLETED").length}/{items.length} certified
        </span>
      </CardHeader>

      <AnimatePresence>
        {completedSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-6"
          >
            <div className="mb-4 flex items-start gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
              <span className="text-pretty">
                Certificate recorded for &ldquo;{completedSuccess}&rdquo;. Proficiency moved up one level on the radar.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divided list instead of stacked bordered boxes */}
      <ol className="flex flex-col divide-y divide-slate-800 border-t border-slate-800">
        {items.map((rec, idx) => {
          const isDone = rec.status === "COMPLETED";
          const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
          const isSyncing = syncingId === rec.id;

          return (
            <li
              key={rec.id}
              className={cn(
                "group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 px-6 py-5 transition-colors duration-200 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center",
                !isDone && "hover:bg-slate-800/40"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 font-mono text-xs tabular-nums sm:mt-0",
                  isDone ? "text-emerald-400" : isEnrolled ? "text-amber-400" : "text-slate-500"
                )}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium leading-snug text-balance",
                    isDone ? "text-slate-400 line-through decoration-slate-600" : "text-white"
                  )}
                >
                  {rec.courseTitle}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400 text-pretty">
                  Resolves <span className="font-medium text-slate-200">{rec.competencyLabel}</span>
                  <span className="text-slate-600"> · </span>
                  <span className="font-mono">{Math.round(rec.matchScore * 100)}% match</span>
                  <span className="text-slate-600"> · </span>
                  <span className="font-mono">{rec.durationHours} h</span>
                  <span className="text-slate-600"> · </span>
                  {rec.provider}
                </p>
              </div>

              {/* Actions — bottom/right aligned as a unit */}
              <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1">
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.12em]",
                    isDone ? "text-emerald-400" : isEnrolled ? "text-amber-400" : "text-slate-500"
                  )}
                >
                  {STATUS_LABEL[rec.status]}
                </span>

                {rec.courseUrl && (
                  <Button variant="ghost" size="icon-sm" asChild className="h-7 w-7 text-slate-500 hover:text-white">
                    <a href={rec.courseUrl} target="_blank" rel="noreferrer" aria-label={`Open ${rec.courseTitle} on iGOT`}>
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
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
