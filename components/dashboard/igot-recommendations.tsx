"use client";

import { useState, useTransition } from "react";
import { ExternalLink, RefreshCw, CheckCircle2, CircleDashed, Award, Sparkles } from "lucide-react";
import { IgotCourse } from "@/lib/data-service";

interface IgotRecommendationsProps {
  userId: string;
  recommendations: IgotCourse[];
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
}

const STATUS_LABEL: Record<IgotCourse["status"], string> = {
  RECOMMENDED: "Recommended for Cadre Gap",
  ENROLLED: "Enrolled in Sunbird",
  IN_PROGRESS: "In Progress (iGOT)",
  COMPLETED: "Completed & Certified",
};

export function IgotRecommendations({
  userId,
  recommendations,
  onSynced,
  onCourseCompleted,
}: IgotRecommendationsProps) {
  const [items, setItems] = useState(recommendations);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sync with internal state if recommendations change
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
    setTimeout(() => setCompletedSuccess(null), 4000);
    onCourseCompleted?.(rec.competencyFracCode, rec.courseTitle);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Personalized Training Pathway
          </p>
          <h3 className="text-lg font-semibold text-white">iGOT Karmayogi Bharat Courses</h3>
        </div>
        <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs text-sky-300">
          Sunbird Linked
        </span>
      </div>

      {completedSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Course Completed:</strong> {completedSuccess} — Competency score increased by +1 level on radar!
          </span>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((rec) => {
          const isDone = rec.status === "COMPLETED";
          const isEnrolled = rec.status === "ENROLLED" || rec.status === "IN_PROGRESS";
          const isSyncing = syncingId === rec.id;

          return (
            <li
              key={rec.id}
              className={`flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                isDone
                  ? "border-emerald-500/30 bg-emerald-950/20"
                  : isEnrolled
                  ? "border-sky-500/30 bg-sky-950/20"
                  : "border-white/10 bg-slate-950/40 hover:bg-slate-950/70"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isEnrolled ? (
                    <Award className="h-5 w-5 text-sky-400" />
                  ) : (
                    <CircleDashed className="h-5 w-5 text-slate-500" />
                  )}
                </span>
                <div>
                  <p className="font-semibold text-sm text-white">{rec.courseTitle}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: <span className="text-slate-200">{rec.competencyLabel}</span> · {Math.round(rec.matchScore * 100)}% gap match · {rec.durationHours} hrs
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300"
                          : isEnrolled
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {STATUS_LABEL[rec.status]}
                    </span>
                    <span className="text-[11px] text-slate-500">Provider: {rec.provider}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-4">
                {rec.courseUrl && (
                  <a
                    href={rec.courseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-slate-850 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                  >
                    View on iGOT
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
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing…" : "Sync to iGOT"}
                  </button>
                )}

                {isEnrolled && !isDone && (
                  <button
                    type="button"
                    onClick={() => handleSimulateComplete(rec)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Simulate Completion</span>
                  </button>
                )}

                {isDone && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 px-2 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Gap Closed</span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
