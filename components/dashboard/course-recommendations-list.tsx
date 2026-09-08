"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  CircleDashed,
  Award,
  Sparkles,
} from "lucide-react";
import { IgotCourse } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseRecommendationsListProps {
  userId: string;
  recommendations: IgotCourse[];
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  IgotCourse["status"],
  { label: string; variant: "warning" | "info" | "secondary" | "success"; icon: typeof CircleDashed }
> = {
  RECOMMENDED: {
    label: "Recommended",
    variant: "warning",
    icon: CircleDashed,
  },
  ENROLLED: {
    label: "Enrolled",
    variant: "info",
    icon: Award,
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "secondary",
    icon: RefreshCw,
  },
  COMPLETED: {
    label: "Certified",
    variant: "success",
    icon: CheckCircle2,
  },
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
    <Card className={cn("border-slate-800/80 bg-slate-900/90 shadow-sm flex flex-col justify-between", className)}>
      <div>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-white">
                iGOT Karmayogi Bharat Courses
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Targeted capacity building courses matched to diagnosed cadre competency deficits
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-slate-400">
              Sunbird Registry
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Completion Success Toast */}
          <AnimatePresence>
            {completedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 flex items-center gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 font-mono"
              >
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Certification Recorded:</strong> &quot;{completedSuccess}&quot; —
                  Proficiency updated on Live Radar (+1 Level).
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course List */}
          <div className="space-y-2.5">
            {items.map((rec) => {
              const isDone = rec.status === "COMPLETED";
              const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
              const isSyncing = syncingId === rec.id;
              const statusMeta = STATUS_CONFIG[rec.status];
              const StatusIcon = statusMeta.icon;

              return (
                <div
                  key={rec.id}
                  className={cn(
                    "rounded-md border p-3 transition-colors flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
                    isDone
                      ? "border-emerald-500/30 bg-emerald-950/15"
                      : isEnrolled
                      ? "border-sky-500/30 bg-sky-950/15"
                      : "border-slate-800 bg-slate-950/60 hover:bg-slate-950/90 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <StatusIcon
                        className={cn(
                          "h-4 w-4",
                          isDone
                            ? "text-emerald-400"
                            : isEnrolled
                            ? "text-sky-400"
                            : "text-slate-500"
                        )}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-white">
                        {rec.courseTitle}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Resolves <span className="text-slate-200 font-medium">{rec.competencyLabel}</span> deficit ·{" "}
                        <span className="font-mono text-slate-300">{Math.round(rec.matchScore * 100)}% match</span> ·{" "}
                        <span className="font-mono">{rec.durationHours} hrs</span> · {rec.provider}
                      </p>
                    </div>
                  </div>

                  {/* Actions & single status chip */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-4 self-end sm:self-center">
                    {rec.courseUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                      >
                        <a
                          href={rec.courseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          <span>iGOT</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}

                    {!isDone && !isEnrolled && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={isSyncing}
                        onClick={() => handleSync(rec)}
                        className="h-7 px-2.5 text-xs gap-1.5"
                      >
                        <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                        <span>{isSyncing ? "Enrolling…" : "Enroll via Sunbird"}</span>
                      </Button>
                    )}

                    {isEnrolled && !isDone && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleSimulateComplete(rec)}
                        className="h-7 px-2.5 text-xs gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Simulate Completion</span>
                      </Button>
                    )}

                    {isDone && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Certified</span>
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
