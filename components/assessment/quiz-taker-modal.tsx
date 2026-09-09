"use client";

import { useState, useEffect } from "react";
import { X, Clock, Check, ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { AssessmentQuestion } from "@/lib/data-service";
import { cn } from "@/lib/utils";

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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

const primaryBtn = cn(
  "inline-flex items-center gap-2 rounded-md bg-amber-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-amber-400 hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-amber-600 disabled:pointer-events-none disabled:opacity-50",
  focusRing
);

const ghostBtn = cn(
  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(questions.length * 90);

  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  const handleSelectAnswer = (choiceId: "A" | "B" | "C" | "D") => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choiceId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const correctCount = questions.filter((q) => selectedAnswers[q.id] === q.correctChoice).length;
  const scorePercent = Math.round((correctCount / totalQ) * 100);
  const passed = scorePercent >= 60;
  const earnedProficiencyDelta = passed ? 1 : 0;

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-taker-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950/60 px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {cadreRank} baseline · FRAC diagnostic
            </p>
            <h2 id="quiz-taker-title" className="text-lg font-semibold tracking-tight text-white">
              {currentQ.competencyLabel}
            </h2>
            <p className="text-xs text-slate-400">Assessing {officerName}</p>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors duration-300",
                  timeLeftSeconds <= 30
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                )}
                aria-live="polite"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-800 hover:text-white active:scale-95",
                focusRing
              )}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSubmitted ? (
            <div className="flex flex-col gap-6">
              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-white">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                  <span className="flex items-center gap-3 font-mono text-[11px]">
                    <span>Bloom · {currentQ.bloomLevel.toLowerCase()}</span>
                    <span>Difficulty · {currentQ.difficulty}/5</span>
                    <span>Answered · {Object.keys(selectedAnswers).length}/{totalQ}</span>
                  </span>
                </div>
                <div className="flex gap-1">
                  {questions.map((q, i) => (
                    <span
                      key={q.id}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        i === currentIndex
                          ? "bg-amber-400"
                          : selectedAnswers[q.id]
                          ? "bg-slate-500"
                          : "bg-slate-800"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Stem */}
              <p className="text-lg font-medium leading-relaxed tracking-tight text-white text-pretty">
                {currentQ.stem}
              </p>

              {/* Choices */}
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer choices">
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
                        "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.995]",
                        focusRing,
                        isSelected
                          ? "border-amber-500/50 bg-amber-500/10 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm font-mono text-xs font-semibold transition-colors duration-200",
                          isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                        )}
                      >
                        {choice.id}
                      </span>
                      <span className="text-sm leading-snug text-pretty">{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results */
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 border-b border-slate-800 pb-8 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">Score</p>
                  <p className="mt-2 text-6xl font-semibold leading-none tracking-tighter text-white">
                    {scorePercent}
                    <span className="text-3xl text-slate-500">%</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {correctCount} of {totalQ} correct
                  </p>
                </div>
                <div className="sm:col-span-7">
                  <h3
                    className={cn(
                      "text-xl font-semibold tracking-tight text-balance",
                      passed ? "text-emerald-300" : "text-amber-300"
                    )}
                  >
                    {passed ? "Benchmark reached" : "Competency gap confirmed"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 text-pretty">
                    {passed
                      ? `Proficiency will move up one level towards the ${cadreRank} baseline when you close this panel.`
                      : "This competency stays flagged as an open gap and the matching iGOT Karmayogi course remains recommended."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  Question review with handbook citations
                </h4>
                <ol className="flex flex-col divide-y divide-slate-800 rounded-md border border-slate-800">
                  {questions.map((q, idx) => {
                    const officerChoice = selectedAnswers[q.id];
                    const isCorrect = officerChoice === q.correctChoice;

                    return (
                      <li key={q.id} className="flex flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-medium leading-snug text-white text-pretty">
                            <span className="mr-2 font-mono text-xs text-slate-500">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {q.stem}
                          </p>
                          <span
                            className={cn(
                              "shrink-0 font-mono text-[11px] uppercase tracking-[0.12em]",
                              isCorrect ? "text-emerald-300" : "text-rose-300"
                            )}
                          >
                            {isCorrect ? "Correct" : `Incorrect · chose ${officerChoice || "none"}`}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-300 text-pretty">
                          <strong className="font-medium text-white">Answer {q.correctChoice}. </strong>
                          {q.rationale}
                        </p>

                        <blockquote className="border-l-2 border-amber-500/40 pl-3 text-xs leading-relaxed text-slate-400">
                          <p className="flex items-center gap-1.5 font-medium text-slate-300">
                            <BookOpen className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                            {q.sourceDocument}
                            <span className="font-normal text-slate-500">· {q.sourceCitation}</span>
                          </p>
                          <p className="mt-1 italic">&ldquo;{q.sourceSnippet}&rdquo;</p>
                        </blockquote>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-4">
          {!isSubmitted ? (
            <>
              <button type="button" onClick={handlePrev} disabled={currentIndex === 0} className={ghostBtn}>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                <span>Previous</span>
              </button>

              {currentIndex === totalQ - 1 ? (
                <button type="button" onClick={handleSubmit} className={primaryBtn}>
                  <span>Submit assessment</span>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={handleNext} className={primaryBtn}>
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </>
          ) : (
            <div className="flex w-full items-center justify-end">
              <button type="button" onClick={handleFinishAndSave} className={primaryBtn}>
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
