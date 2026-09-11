"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Check, ArrowRight, ArrowLeft, AlertCircle, Lock, Sparkles } from "lucide-react";
import { AssessmentQuestion } from "@/lib/data-service";
import { cn } from "@/lib/utils";
import { CitationAccordion } from "@/components/ui/citation-accordion";

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
  const [status, setStatus] = useState<"in-progress" | "completed">("in-progress");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(360);
  const [aiExplanations, setAiExplanations] = useState<Record<string, { simpleExplanation: string; misconceptionAnalysis?: string; sourceGroundedEvidence?: string; keyTakeaway?: string; provider?: string }>>({});
  const [loadingExplanationId, setLoadingExplanationId] = useState<string | null>(null);

  const handleFetchExplanation = async (q: AssessmentQuestion) => {
    if (aiExplanations[q.id]) return;
    setLoadingExplanationId(q.id);
    try {
      const res = await fetch("/api/ai/explain-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          chosenChoiceId: selectedAnswers[q.id] || "None",
          officerName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanations((prev) => ({
          ...prev,
          [q.id]: data,
        }));
      }
    } catch (err) {
      console.warn("AI explanation fetch failed:", err);
    } finally {
      setLoadingExplanationId(null);
    }
  };

  // Pre-fetch explanations for questions when assessment is completed
  useEffect(() => {
    if (status === "completed" && questions && questions.length > 0) {
      questions.forEach((q) => {
        handleFetchExplanation(q);
      });
    }
  }, [status, questions]);

  // Reset all states cleanly whenever modal opens with fresh questions
  useEffect(() => {
    if (isOpen && questions && questions.length > 0) {
      setStatus("in-progress");
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeLeftSeconds(Math.max(questions.length * 90, 360));
    }
  }, [isOpen, questions]);

  // Block browser navigation / tab close while quiz is in progress
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (status === "in-progress") {
        e.preventDefault();
        e.returnValue = "You have an assessment in progress. Your answers will be lost if you leave.";
        return e.returnValue;
      }
    },
    [status]
  );

  useEffect(() => {
    if (isOpen && status === "in-progress") {
      window.addEventListener("beforeunload", handleBeforeUnload);
      // Block Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && status === "in-progress") {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      window.addEventListener("keydown", handleKeyDown, true);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [isOpen, status, handleBeforeUnload]);

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
  const allAnswered = answeredCount === totalQ;

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
      className="quiz-fullscreen-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-taker-title"
    >
      <div className="quiz-fullscreen-container">
        {/* Header */}
        <div className="quiz-fs-header">
          <div className="quiz-fs-header-left">
            <div className="quiz-fs-meta">
              <span className="quiz-fs-badge-cadre">{cadreRank} Baseline</span>
              <span className="quiz-fs-separator">·</span>
              <span className="quiz-fs-label">FRAC Diagnostic Quiz</span>
              <span className="quiz-fs-separator">·</span>
              <span className={status === "in-progress" ? "quiz-fs-status-active" : "quiz-fs-status-done"}>
                {status === "in-progress" ? "In Progress" : "Evaluation Complete"}
              </span>
            </div>
            <h2 id="quiz-taker-title" className="quiz-fs-title">
              {currentQ.competencyLabel || "Statistical Capacity Assessment"}
            </h2>
            <p className="quiz-fs-officer">
              Assessing officer <strong>{officerName}</strong>
            </p>
          </div>

          <div className="quiz-fs-header-right">
            {status === "in-progress" && (
              <>
                <div className="quiz-fs-lock-badge">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  <span>Assessment Locked</span>
                </div>
                <div
                  className={cn(
                    "quiz-fs-timer",
                    timeLeftSeconds <= 60 && "quiz-fs-timer-urgent"
                  )}
                  aria-live="polite"
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="quiz-fs-body">
          {status === "in-progress" ? (
            <div className="quiz-fs-question-area">
              {/* Progress bar & question meta */}
              <div className="quiz-fs-progress-section">
                <div className="quiz-fs-progress-meta">
                  <div className="quiz-fs-progress-left">
                    <span className="quiz-fs-q-counter">
                      Question {currentIndex + 1} of {totalQ}
                    </span>
                    <span className="quiz-fs-cadre-pill">{cadreRank} Benchmark</span>
                  </div>
                  <div className="quiz-fs-progress-right">
                    <span>Bloom: {currentQ.bloomLevel.toLowerCase()}</span>
                    <span>·</span>
                    <span>Difficulty: {currentQ.difficulty}/5</span>
                    <span>·</span>
                    <span className={allAnswered ? "quiz-fs-answered-complete" : "quiz-fs-answered-pending"}>
                      Answered: {answeredCount}/{totalQ}
                    </span>
                  </div>
                </div>

                {/* Clickable Progress Segment Bar */}
                <div className="quiz-fs-segments">
                  {questions.map((q, i) => {
                    const isAnswered = Boolean(selectedAnswers[q.id]);
                    const isCurrent = i === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        title={`Question ${i + 1} ${isAnswered ? "(Answered)" : "(Unanswered)"}`}
                        className={cn(
                          "quiz-fs-segment",
                          isCurrent && "quiz-fs-segment-current",
                          isAnswered && !isCurrent && "quiz-fs-segment-answered"
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Question Stem */}
              <div className="quiz-fs-stem">
                <p>{currentQ.stem}</p>
              </div>

              {/* Selectable Radio Options */}
              <div className="quiz-fs-choices" role="radiogroup" aria-label="Answer choices">
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
                        "quiz-fs-choice",
                        isSelected && "quiz-fs-choice-selected"
                      )}
                    >
                      <span className={cn("quiz-fs-choice-letter", isSelected && "quiz-fs-choice-letter-selected")}>
                        {choice.id}
                      </span>
                      <span className="quiz-fs-choice-text">{choice.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unanswered reminder */}
              {currentIndex === totalQ - 1 && !allAnswered && (
                <div className="quiz-fs-warning">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    You have {totalQ - answeredCount} unanswered question{totalQ - answeredCount > 1 ? "s" : ""}.
                    Review before submitting.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Results & Review State */
            <div className="quiz-fs-results">
              {/* Score Overview */}
              <div className="quiz-fs-score-section">
                <div className="quiz-fs-score-left">
                  <p className="quiz-fs-score-label">Diagnostic Score</p>
                  <p className="quiz-fs-score-number">
                    {scorePercent}
                    <span className="quiz-fs-score-percent">%</span>
                  </p>
                  <p className="quiz-fs-score-detail">
                    {correctCount} of {totalQ} correct answers
                  </p>
                </div>
                <div className="quiz-fs-score-right">
                  <h3 className={passed ? "quiz-fs-result-pass" : "quiz-fs-result-fail"}>
                    {passed ? "Cadre Benchmark Achieved" : "Competency Gap Identified"}
                  </h3>
                  <p className="quiz-fs-result-desc">
                    {passed
                      ? `Officer proficiency will increment by +1 level toward the ${cadreRank} baseline upon saving.`
                      : "This competency remains tagged as an active gap. Recommended iGOT Karmayogi modules have been aligned below."}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown with Citations */}
              <div className="quiz-fs-review">
                <h4 className="quiz-fs-review-heading">Question Review & Handbook Grounding</h4>
                <ol className="quiz-fs-review-list">
                  {questions.map((q, idx) => {
                    const officerChoice = selectedAnswers[q.id];
                    const isCorrect = officerChoice === q.correctChoice;

                    return (
                      <li key={q.id} className="quiz-fs-review-item">
                        <div className="quiz-fs-review-top">
                          <p className="quiz-fs-review-stem">
                            <span className="quiz-fs-review-num">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            {q.stem}
                          </p>
                          <span className={isCorrect ? "quiz-fs-badge-correct" : "quiz-fs-badge-wrong"}>
                            {isCorrect ? "Correct" : `Incorrect · Chose ${officerChoice || "None"}`}
                          </span>
                        </div>

                        <p className="quiz-fs-review-rationale">
                          <strong>Answer {q.correctChoice}. </strong>
                          {q.rationale}
                        </p>

                        {/* AI Grounded Answer Explanation */}
                        {aiExplanations[q.id] ? (
                          <div className="mt-2.5 rounded-lg border border-primary/25 bg-slate-50/80 p-3 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px] mb-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              <span>AI Answer Analysis & Grounding</span>
                              <span className="text-[10px] text-fg-muted font-mono ml-auto">
                                {aiExplanations[q.id].provider}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-fg">
                              {aiExplanations[q.id].simpleExplanation}
                            </p>
                            {aiExplanations[q.id].misconceptionAnalysis && (
                              <p className="mt-1.5 text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                                <strong>Misconception Check: </strong>
                                {aiExplanations[q.id].misconceptionAnalysis}
                              </p>
                            )}
                            {aiExplanations[q.id].keyTakeaway && (
                              <div className="mt-1.5 flex items-start gap-1 text-[10px] font-medium text-teal-800">
                                <Check className="h-3 w-3 shrink-0 mt-0.5" />
                                <span>{aiExplanations[q.id].keyTakeaway}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFetchExplanation(q)}
                            disabled={loadingExplanationId === q.id}
                            className="mt-2 inline-flex items-center gap-1.5 rounded border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Sparkles className={cn("h-3 w-3", loadingExplanationId === q.id && "animate-spin")} />
                            <span>{loadingExplanationId === q.id ? "Analyzing with AI…" : "Get AI Grounded Explanation"}</span>
                          </button>
                        )}

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
        <div className="quiz-fs-footer">
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
                    disabled={!allAnswered}
                    className={submitBtn}
                    title={allAnswered ? "Submit your assessment" : "Answer all questions before submitting"}
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
