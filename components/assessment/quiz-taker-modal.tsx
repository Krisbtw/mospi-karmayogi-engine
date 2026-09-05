"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Quote,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { AssessmentQuestion } from "@/lib/data-service";

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

  // Timer countdown
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

  // Calculate results
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctChoice
  ).length;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                MoSPI FRAC Diagnostic Assessment
              </span>
              <span className="rounded bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                {cadreRank} Baseline
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assessing: {officerName} · Competency: {currentQ.competencyLabel}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Question metadata & stepper */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                  <span className="rounded bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">
                    Bloom: {currentQ.bloomLevel}
                  </span>
                  <span className="rounded bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px]">
                    Difficulty: Lvl {currentQ.difficulty}/5
                  </span>
                </div>
                <span>Answered: {Object.keys(selectedAnswers).length}/{totalQ}</span>
              </div>

              {/* Stem */}
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-base font-medium leading-relaxed text-white">
                  {currentQ.stem}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedAnswers[currentQ.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelectAnswer(choice.id)}
                      className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500"
                          : "border-white/10 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-semibold text-xs transition-colors ${
                          isSelected
                            ? "bg-sky-500 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {choice.id}
                      </span>
                      <span className="text-sm leading-snug">{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results Review Screen */
            <div className="space-y-6">
              {/* Score banner */}
              <div
                className={`rounded-2xl border p-6 text-center ${
                  passed
                    ? "border-emerald-500/40 bg-emerald-950/30"
                    : "border-rose-500/40 bg-rose-950/30"
                }`}
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 mb-2">
                  {passed ? (
                    <Award className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {passed ? "Assessment Passed!" : "Competency Gap Identified"}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  You scored <strong className="text-white">{scorePercent}%</strong> ({correctCount}/{totalQ} correct).
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-1.5 text-xs">
                  {passed ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">
                        Proficiency updated: Target baseline achieved for {cadreRank}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-amber-300 font-medium">
                        Flagged as Active Skill Gap → Recommended on iGOT Karmayogi
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Question Review with Grounded Citations */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Question Review & Grounded Handbook Citations
                </h4>
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const officerChoice = selectedAnswers[q.id];
                    const isCorrect = officerChoice === q.correctChoice;

                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-white/10 bg-slate-950/50 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">Q{idx + 1}.</span>
                            <span className="text-xs text-slate-300 font-medium">{q.stem}</span>
                          </div>
                          {isCorrect ? (
                            <span className="flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[11px] font-medium shrink-0">
                              <CheckCircle2 className="h-3 w-3" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded bg-rose-500/15 text-rose-300 px-2 py-0.5 text-[11px] font-medium shrink-0">
                              <XCircle className="h-3 w-3" /> Incorrect (Chose {officerChoice || "None"})
                            </span>
                          )}
                        </div>

                        {/* Rationale */}
                        <div className="rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-300">
                          <strong className="text-white font-medium">Correct Answer: {q.correctChoice} — </strong>
                          {q.rationale}
                        </div>

                        {/* Grounded Citation Box */}
                        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-3 text-xs text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5 text-sky-400 font-medium text-[11px]">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Grounded Source: {q.sourceDocument}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            Section: {q.sourceCitation}
                          </p>
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-300 pt-1 border-t border-sky-500/10">
                            <Quote className="h-3 w-3 text-sky-400 shrink-0 mt-0.5" />
                            <span>&quot;{q.sourceSnippet}&quot;</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/60 px-6 py-4">
          {!isSubmitted ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex === totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    <span>Submit Assessment</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={handleFinishAndSave}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition-all"
              >
                <span>Update Competency Profile & Close</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
