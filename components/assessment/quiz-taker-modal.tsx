"use client";

import { useState, useEffect } from "react";
import { X, Clock, Check, ArrowRight, ArrowLeft, BookOpen, AlertCircle, ShieldCheck } from "lucide-react";
import { AssessmentQuestion } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { CitationAccordion, CitationItem } from "@/components/ui/citation-accordion";

interface QuizTakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: AssessmentQuestion[];
  officerName: string;
  cadreRank: string;
  onAssessmentCompleted: (result: {
    scorePercent: number;
    competencyFracCode: string;
    passed: boolean;
    earnedProficiencyDelta: number;
  }) => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const primaryBtn = cn(
  "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-primary/80 disabled:pointer-events-none disabled:opacity-50",
  focusRing
);

const submitBtn = cn(
  "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-primary disabled:pointer-events-none disabled:opacity-50",
  focusRing
);

const ghostBtn = cn(
  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-fg-muted transition-colors duration-200 hover:bg-bg hover:text-fg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  focusRing
);

export function QuizTakerModal({
  isOpen,
  onClose,
  questions,
  officerName,
  cadreRank,
  onAssessmentCompleted,
}: QuizTakerModalProps) {
  // Modal State Machine: "in-progress" vs "completed"
  const [status, setStatus] = useState<"in-progress" | "completed">("in-progress");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(360); // 6 minutes default

  // Reset all states cleanly whenever modal opens with fresh questions
  useEffect(() => {
    if (isOpen && questions && questions.length > 0) {
      setStatus("in-progress");
      setCurrentIndex(0);
      setSelectedAnswers({});
      // 6 minutes countdown (360 seconds) or 2 minutes per question if larger pool
      setTimeLeftSeconds(Math.max(questions.length * 90, 360));
    }
  }, [isOpen, questions]);

  // Real-time timer countdown during "in-progress" state
  useEffect(() => {
    if (!isOpen || status !== "in-progress" || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, status, timeLeftSeconds]);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex] || questions[0];
  const totalQ = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectAnswer = (choiceId: "A" | "B" | "C" | "D") => {
    if (status === "completed") return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choiceId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit assessment and transition to results
  const handleSubmitAssessment = () => {
    setStatus("completed");
  };

  // Scoring logic
  const correctCount = questions.filter((q) => selectedAnswers[q.id] === q.correctChoice).length;
  const scorePercent = Math.round((correctCount / totalQ) * 100);
  const passed = scorePercent >= 60;
  const earnedProficiencyDelta = passed ? 1 : 0;

  const handleFinishAndSave = () => {
    onAssessmentCompleted({
      scorePercent,
      competencyFracCode: questions[0]?.competencyFracCode || "FN-STAT-014",
      passed,
      earnedProficiencyDelta,
    });
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123158]/25 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-taker-title"
    >
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface text-fg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                {cadreRank} Baseline · FRAC Diagnostic Quiz
              </span>
              <span className="h-1 w-1 rounded-full bg-fg-muted" />
              <span className="font-mono text-[11px] text-primary">
                {status === "in-progress" ? "In Progress" : "Evaluation Complete"}
              </span>
            </div>
            <h2 id="quiz-taker-title" className="text-lg font-semibold tracking-tight text-fg">
              {currentQ.competencyLabel || "Statistical Capacity Assessment"}
            </h2>
            <p className="text-xs text-fg-muted">
              Assessing officer <span className="font-medium text-fg">{officerName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {status === "in-progress" && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors duration-300",
                  timeLeftSeconds <= 60
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-border bg-surface text-fg-muted"
                )}
                aria-live="polite"
              >
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "rounded-md p-1.5 text-fg-muted transition-colors duration-200 hover:bg-bg hover:text-fg active:scale-95",
                focusRing
              )}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === "in-progress" ? (
            /* Question-Taking State */
            <div className="flex flex-col gap-6">
              {/* Question Navigation & Cadre Tagging Bar */}
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg">
                      Question {currentIndex + 1} of {totalQ}
                    </span>
                    <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-primary">
                      {cadreRank} Benchmark
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-fg-muted">
                    <span>Bloom: {currentQ.bloomLevel.toLowerCase()}</span>
                    <span>·</span>
                    <span>Difficulty: {currentQ.difficulty}/5</span>
                    <span>·</span>
                    <span className={answeredCount === totalQ ? "text-emerald-700" : "text-amber-700"}>
                      Answered: {answeredCount}/{totalQ}
                    </span>
                  </div>
                </div>

                {/* Clickable Progress Segment Bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  {questions.map((q, i) => {
                    const isAnswered = Boolean(selectedAnswers[q.id]);
                    const isCurrent = i === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        title={`Jump to Question ${i + 1} ${isAnswered ? "(Answered)" : "(Unanswered)"}`}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-all duration-200",
                          isCurrent
                            ? "bg-primary ring-2 ring-primary/40"
                            : isAnswered
                            ? "bg-fg-muted hover:bg-fg-muted"
                            : "bg-bg hover:bg-bg"
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Question Stem */}
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-base sm:text-lg font-medium leading-relaxed tracking-tight text-fg text-pretty">
                  {currentQ.stem}
                </p>
              </div>

              {/* Selectable Radio Options */}
              <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Answer choices">
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedAnswers[currentQ.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectAnswer(choice.id)}
                      className={cn(
                        "group flex w-full items-start gap-3.5 rounded-lg border p-4 text-left transition-all duration-200 active:scale-[0.995]",
                        focusRing,
                        isSelected
                          ? "border-primary bg-primary/10 text-fg shadow-sm shadow-primary/20"
                          : "border-border bg-surface text-fg-muted hover:border-border hover:bg-bg hover:text-fg"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors duration-200",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-bg text-fg-muted group-hover:bg-bg group-hover:text-fg"
                        )}
                      >
                        {choice.id}
                      </span>
                      <span className="text-sm leading-relaxed text-pretty pt-0.5">
                        {choice.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Unanswered reminder banner if approaching final question */}
              {currentIndex === totalQ - 1 && answeredCount < totalQ && (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    You have {totalQ - answeredCount} unanswered question{totalQ - answeredCount > 1 ? "s" : ""}. You can review previous questions or submit now.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Results & Review State (Rendered only after explicit submission) */
            <div className="flex flex-col gap-8">
              {/* Score Overview */}
              <div className="grid grid-cols-1 gap-6 border-b border-border pb-8 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                    Diagnostic Score
                  </p>
                  <p className="mt-2 text-6xl font-semibold leading-none tracking-tighter text-fg">
                    {scorePercent}
                    <span className="text-3xl text-fg-muted">%</span>
                  </p>
                  <p className="mt-2 text-sm text-fg-muted">
                    {correctCount} of {totalQ} correct answers
                  </p>
                </div>
                <div className="sm:col-span-7">
                  <h3
                    className={cn(
                      "text-xl font-semibold tracking-tight text-balance",
                      passed ? "text-emerald-700" : "text-amber-700"
                    )}
                  >
                    {passed ? "Cadre Benchmark Achieved" : "Competency Gap Identified"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted text-pretty">
                    {passed
                      ? `Officer proficiency will increment by +1 level toward the ${cadreRank} baseline upon saving.`
                      : "This competency remains tagged as an active gap. Recommended iGOT Karmayogi modules have been aligned below."}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown with Citations */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
                  Question Review & Handbook Grounding
                </h4>
                <ol className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
                  {questions.map((q, idx) => {
                    const officerChoice = selectedAnswers[q.id];
                    const isCorrect = officerChoice === q.correctChoice;

                    return (
                      <li key={q.id} className="flex flex-col gap-3 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-medium leading-snug text-fg text-pretty">
                            <span className="mr-2 font-mono text-xs text-fg-muted">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {q.stem}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em]",
                              isCorrect
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border border-red-200 bg-red-50 text-red-700"
                            )}
                          >
                            {isCorrect ? "Correct" : `Incorrect · Chose ${officerChoice || "None"}`}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-fg-muted text-pretty">
                          <strong className="font-semibold text-fg">Answer {q.correctChoice}. </strong>
                          {q.rationale}
                        </p>

                        <div className="mt-1">
                          <CitationAccordion
                            citations={[
                              {
                                id: q.id,
                                sourceDocument: q.sourceDocument,
                                sourceCitation: q.sourceCitation,
                                sourceSnippet: q.sourceSnippet,
                                handbookSection: `Verified via RAG: ${q.sourceCitation}`,
                                fracMapping: q.competencyFracCode,
                              },
                            ]}
                            title="Ground-Truth Citation & Evidence Snippet"
                            defaultExpanded={!isCorrect}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-4">
          {status === "in-progress" ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={ghostBtn}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex === totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmitAssessment}
                    className={submitBtn}
                  >
                    <span>Submit Assessment</span>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={primaryBtn}
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-end">
              <button
                type="button"
                onClick={handleFinishAndSave}
                className={primaryBtn}
              >
                <span>Update competency profile and close</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
