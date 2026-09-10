"use client";

import { useState, useTransition } from "react";
import { ExternalLink, RefreshCw, CheckCircle2, CircleDashed, Award, Sparkles } from "lucide-react";
import { IgotCourse } from "@/lib/data-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IgotRecommendationsProps {
  userId: string;
  recommendations: IgotCourse[];
  onSynced?: (id: string, nextStatus: IgotCourse["status"]) => void;
  onCourseCompleted?: (competencyFracCode: string, courseTitle: string) => void;
}

const STATUS_MAP: Record<
  IgotCourse["status"],
  { label: string; variant: "warning" | "info" | "secondary" | "success" }
> = {
  RECOMMENDED: { label: "Recommended for Gap", variant: "warning" },
  ENROLLED: { label: "Enrolled in Sunbird", variant: "info" },
  IN_PROGRESS: { label: "In Progress (iGOT)", variant: "secondary" },
  COMPLETED: { label: "Completed & Certified", variant: "success" },
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
    <Card className="border-slate-800/80 bg-slate-900/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
              Personalized Training Pathway
            </span>
            <CardTitle className="mt-1 text-lg">iGOT Karmayogi Bharat Courses</CardTitle>
            <CardDescription className="mt-0.5">
              Certified capacity building modules aligned with Bharat FRAC standards
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            Sunbird Sandbox Mode
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {completedSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
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
            const meta = STATUS_MAP[rec.status];

            return (
              <li
                key={rec.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
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
                      Target: <span className="text-slate-200">{rec.competencyLabel}</span> ·{" "}
                      <span className="font-mono">{Math.round(rec.matchScore * 100)}%</span> gap match ·{" "}
                      <span className="font-mono">{rec.durationHours} hrs</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={meta.variant} className="text-xs">
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-slate-500">Provider: {rec.provider}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-4">
                  {rec.courseUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 gap-1.5 text-xs"
                    >
                      <a
                        href={rec.courseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>View on iGOT</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    </Button>
                  )}

                  {!isDone && !isEnrolled && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isSyncing}
                      onClick={() => handleSync(rec)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>{isSyncing ? "Syncing…" : "Sync to iGOT"}</span>
                    </Button>
                  )}

                  {isEnrolled && !isDone && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSimulateComplete(rec)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Simulate Completion</span>
                    </Button>
                  )}

                  {isDone && (
                    <Badge variant="success" className="gap-1 py-1 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Gap Closed</span>
                    </Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
