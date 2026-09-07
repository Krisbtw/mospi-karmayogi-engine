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
  BookOpen,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { IgotCourse } from "@/lib/data-service";
import { cn } from "@/lib/utils";

interface CourseRecommendationsListProps {
  userId: string;
  recommendations: IgotCourse[];
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  IgotCourse["status"],
  { label: string; badgeClass: string; icon: typeof CircleDashed }
> = {
  RECOMMENDED: {
    label: "Recommended for Cadre Gap",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: CircleDashed,
  },
  ENROLLED: {
    label: "Enrolled in Sunbird",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: Award,
  },
  IN_PROGRESS: {
    label: "In Progress (iGOT)",
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: RefreshCw,
  },
  COMPLETED: {
    label: "Completed & Certified",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
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

  // Sync state if props change
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Header Telemetry */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                Prescribed Training Pathways
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                FRAC Gap Mapped
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              iGOT Karmayogi Bharat Courses
            </h3>
          </div>
          <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-300">
            Sunbird Registry Active
          </span>
        </div>

        {/* Completion Success Toast */}
        <AnimatePresence>
          {completedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 font-mono shadow-lg"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 animate-spin" />
              <span>
                <strong>Certification Recorded:</strong> &quot;{completedSuccess}&quot; —
                Competency proficiency increased by <span className="text-white underline">+1 Level</span> on Live Radar!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Course List */}
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {items.map((rec) => {
            const isDone = rec.status === "COMPLETED";
            const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
            const isSyncing = syncingId === rec.id;
            const statusMeta = STATUS_CONFIG[rec.status];
            const StatusIcon = statusMeta.icon;

            return (
              <motion.li
                key={rec.id}
                variants={itemVariants}
                layout
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-4 transition-all flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                  isDone
                    ? "border-emerald-500/30 bg-emerald-950/15"
                    : isEnrolled
                    ? "border-sky-500/30 bg-sky-950/20"
                    : "border-slate-800/80 bg-slate-950/50 hover:bg-slate-900/80 hover:border-slate-700"
                )}
              >
                {/* Left accent indicator */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-[3px]",
                    isDone ? "bg-emerald-500" : isEnrolled ? "bg-sky-500" : "bg-amber-500/60"
                  )}
                />

                <div className="flex items-start gap-3 pl-1">
                  <div className="mt-1 shrink-0">
                    <StatusIcon
                      className={cn(
                        "h-5 w-5",
                        isDone
                          ? "text-emerald-400"
                          : isEnrolled
                          ? "text-sky-400"
                          : "text-slate-500"
                      )}
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm text-white group-hover:text-sky-200 transition-colors">
                        {rec.courseTitle}
                      </h4>
                      <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 text-[10px] font-mono text-sky-300">
                        {Math.round(rec.matchScore * 100)}% Gap Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Resolves Cadre Deficit:{" "}
                      <strong className="text-slate-200 font-medium">
                        {rec.competencyLabel}
                      </strong>
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-[10px] font-medium",
                          statusMeta.badgeClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {rec.durationHours} hrs
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{rec.provider}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-4 self-end sm:self-center">
                  {rec.courseUrl && (
                    <a
                      href={rec.courseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                    >
                      <span>iGOT Portal</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  )}

                  {!isDone && !isEnrolled && (
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => handleSync(rec)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md disabled:opacity-50"
                    >
                      <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
                      {isSyncing ? "Enrolling…" : "Enroll via Sunbird"}
                    </button>
                  )}

                  {isEnrolled && !isDone && (
                    <button
                      type="button"
                      onClick={() => handleSimulateComplete(rec)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simulate Completion</span>
                    </button>
                  )}

                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Gap Closed</span>
                    </span>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}
