"use client";

import React, { useState } from "react";
import { Check, Edit3, XCircle, Search, Filter, BookOpen, AlertCircle, Sparkles, FileText, CheckCircle2, RotateCcw } from "lucide-react";
import { AssessmentQuestion, QuestionChoice, ReviewStatus, ReviewableQuestion } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export type { ReviewStatus, ReviewableQuestion };

interface QuestionReviewViewProps {
  questions: ReviewableQuestion[];
  onApproveQuestion: (id: string) => void;
  onRejectQuestion: (id: string, reason?: string) => void;
  onEditQuestion: (updated: ReviewableQuestion) => void;
  onResetAll?: () => void;
}

export function QuestionReviewView({
  questions,
  onApproveQuestion,
  onRejectQuestion,
  onEditQuestion,
  onResetAll,
}: QuestionReviewViewProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<ReviewableQuestion | null>(null);

  // Edit form state
  const [editStem, setEditStem] = useState("");
  const [editChoices, setEditChoices] = useState<QuestionChoice[]>([]);
  const [editCorrectChoice, setEditCorrectChoice] = useState<"A" | "B" | "C" | "D">("A");
  const [editRationale, setEditRationale] = useState("");
  const [editDifficulty, setEditDifficulty] = useState(3);

  const handleOpenEdit = (q: ReviewableQuestion) => {
    setEditingQuestion(q);
    setEditStem(q.stem);
    setEditChoices([...q.choices]);
    setEditCorrectChoice(q.correctChoice);
    setEditRationale(q.rationale);
    setEditDifficulty(q.difficulty);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const updated: ReviewableQuestion = {
      ...editingQuestion,
      stem: editStem,
      choices: editChoices,
      correctChoice: editCorrectChoice,
      rationale: editRationale,
      difficulty: editDifficulty,
      reviewStatus: "EDITED",
      reviewedAt: "Just now (Admin Edited)",
    };

    onEditQuestion(updated);
    setEditingQuestion(null);
  };

  const handleChoiceTextChange = (id: "A" | "B" | "C" | "D", text: string) => {
    setEditChoices((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text } : c))
    );
  };

  // Counts
  const totalCount = questions.length;
  const pendingCount = questions.filter((q) => q.reviewStatus === "UNDER_REVIEW" || q.reviewStatus === "GENERATED").length;
  const approvedCount = questions.filter((q) => q.reviewStatus === "APPROVED").length;
  const editedCount = questions.filter((q) => q.reviewStatus === "EDITED").length;
  const rejectedCount = questions.filter((q) => q.reviewStatus === "REJECTED").length;

  const filtered = questions.filter((q) => {
    const matchesFilter =
      activeFilter === "ALL"
        ? true
        : activeFilter === "UNDER_REVIEW"
        ? q.reviewStatus === "UNDER_REVIEW" || q.reviewStatus === "GENERATED"
        : q.reviewStatus === activeFilter;

    const matchesSearch =
      q.stem.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      q.competencyLabel.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      q.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      q.sourceCitation.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"><Check className="h-3 w-3" /> Approved</span>;
      case "EDITED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"><Edit3 className="h-3 w-3" /> Admin Edited</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"><XCircle className="h-3 w-3" /> Rejected</span>;
      case "UNDER_REVIEW":
      case "GENERATED":
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"><Sparkles className="h-3 w-3" /> Under Review</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
              Human-In-The-Loop Validation
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-fg mt-0.5">
            AI Question Review Studio
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            Validate, edit, or reject AI/RAG generated diagnostic MCQs before releasing them into official cadre assessments.
          </p>
        </div>

        {onResetAll && (
          <Button variant="ghost" size="sm" onClick={onResetAll} className="gap-1.5 text-xs text-fg-muted hover:text-fg self-start sm:self-auto">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Pool</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeFilter === "ALL"
              ? "bg-primary text-white shadow-sm"
              : "bg-surface border border-border text-fg-muted hover:bg-slate-50"
          )}
        >
          All Questions ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("UNDER_REVIEW")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeFilter === "UNDER_REVIEW"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-surface border border-border text-amber-700 hover:bg-amber-50"
          )}
        >
          Pending Review ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("APPROVED")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeFilter === "APPROVED"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-surface border border-border text-emerald-700 hover:bg-emerald-50"
          )}
        >
          Approved ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("EDITED")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeFilter === "EDITED"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-surface border border-border text-sky-700 hover:bg-sky-50"
          )}
        >
          Edited ({editedCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("REJECTED")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeFilter === "REJECTED"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-surface border border-border text-rose-700 hover:bg-rose-50"
          )}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-fg-muted" />
        <input
          type="text"
          placeholder="Search questions, source citation, or competency..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-fg-muted" />
            <p className="mt-3 text-sm font-semibold text-fg">No questions found</p>
            <p className="text-xs text-fg-muted mt-1">
              No questions matched the selected filter or query.
            </p>
          </div>
        ) : (
          filtered.map((q, index) => (
            <div
              key={q.id}
              className={cn(
                "rounded-xl border bg-surface p-5 shadow-sm transition-all",
                q.reviewStatus === "APPROVED"
                  ? "border-emerald-500/30"
                  : q.reviewStatus === "REJECTED"
                  ? "border-rose-500/30 opacity-70 bg-rose-50/10"
                  : q.reviewStatus === "EDITED"
                  ? "border-sky-500/40"
                  : "border-border hover:border-amber-500/50"
              )}
            >
              {/* Question Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-fg-muted">#{index + 1}</span>
                  {getStatusBadge(q.reviewStatus)}
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-fg-muted">
                    {q.competencyFracCode} · {q.competencyLabel}
                  </span>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-primary">
                    Difficulty {q.difficulty}/5
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-fg-muted">
                    Bloom: {q.bloomLevel}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(q)}
                    className="h-7 gap-1 px-2.5 text-xs border-border hover:border-sky-500/40 text-fg"
                    title="Edit MCQ stem, choices, or rationale"
                  >
                    <Edit3 className="h-3 w-3 text-sky-600" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={q.reviewStatus === "REJECTED"}
                    onClick={() => onRejectQuestion(q.id)}
                    className={cn(
                      "h-7 gap-1 px-2.5 text-xs border-rose-200 text-rose-700 hover:bg-rose-50",
                      q.reviewStatus === "REJECTED" && "opacity-50 cursor-not-allowed"
                    )}
                    title="Reject question from evaluation pool"
                  >
                    <XCircle className="h-3 w-3 text-rose-600" />
                    <span>Reject</span>
                  </Button>

                  <Button
                    variant={q.reviewStatus === "APPROVED" ? "outline" : "default"}
                    size="sm"
                    onClick={() => onApproveQuestion(q.id)}
                    className={cn(
                      "h-7 gap-1 px-3 text-xs",
                      q.reviewStatus === "APPROVED"
                        ? "border-emerald-500/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                    title="Approve question for civil service assessments"
                  >
                    <Check className="h-3 w-3" />
                    <span>{q.reviewStatus === "APPROVED" ? "Approved" : "Approve"}</span>
                  </Button>
                </div>
              </div>

              {/* Question Stem */}
              <p className="text-sm font-semibold text-fg leading-snug">
                {q.stem}
              </p>

              {/* 4 Choices Grid */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.choices.map((choice) => {
                  const isCorrect = choice.id === q.correctChoice;
                  return (
                    <div
                      key={choice.id}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
                        isCorrect
                          ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-fg font-medium"
                          : "border-border bg-slate-50/40 dark:bg-slate-900/40 text-fg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold font-mono",
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        )}
                      >
                        {choice.id}
                      </span>
                      <span className="leading-snug">{choice.text}</span>
                      {isCorrect && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Rationale */}
              <div className="mt-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 border border-border/80 text-xs">
                <p className="font-semibold text-fg">
                  Rationale: <span className="font-normal text-fg-muted">{q.rationale}</span>
                </p>

                {/* Ground Truth Citation */}
                <div className="mt-2 flex items-start gap-2 text-[11px] text-primary border-t border-border/60 pt-2">
                  <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{q.sourceDocument}</span>
                    <span className="text-fg-muted"> — {q.sourceCitation}</span>
                  </div>
                </div>

                {/* Snippet Excerpt */}
                {q.sourceSnippet && (
                  <p className="mt-1.5 rounded bg-surface/90 p-2 text-[11px] font-mono text-fg-muted border border-border/60 italic leading-relaxed">
                    &ldquo;{q.sourceSnippet}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                  Human-In-The-Loop Editor
                </span>
                <h3 className="text-lg font-bold text-fg">Edit Question & Grounding</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-fg-muted hover:text-fg"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-fg mb-1">Question Stem</label>
                <textarea
                  value={editStem}
                  onChange={(e) => setEditStem(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-fg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-fg mb-1">Choices</label>
                <div className="space-y-2">
                  {editChoices.map((choice) => (
                    <div key={choice.id} className="flex items-center gap-2">
                      <span className="font-mono font-bold text-fg w-4">{choice.id}.</span>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                        required
                        className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-fg mb-1">Correct Choice</label>
                  <select
                    value={editCorrectChoice}
                    onChange={(e) => setEditCorrectChoice(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-fg focus:border-primary focus:outline-none"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-fg mb-1">Difficulty Level (1-5)</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-fg focus:border-primary focus:outline-none"
                  >
                    <option value={1}>1 - Foundational (Definitions)</option>
                    <option value={2}>2 - Basic Operations</option>
                    <option value={3}>3 - Intermediate (JSO Cadre)</option>
                    <option value={4}>4 - Advanced (SO Analytics)</option>
                    <option value={5}>5 - Expert (DD Methodology)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-fg mb-1">Explanation / Rationale</label>
                <textarea
                  value={editRationale}
                  onChange={(e) => setEditRationale(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-fg focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" type="button" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Edited Version
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
