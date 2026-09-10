"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { DocumentItem, CompetencyItem, getCompetencyForDocument } from "@/lib/data-service";
import { cn } from "@/lib/utils";

interface QuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  competencies: CompetencyItem[];
  cadreRank: "JSO" | "SO" | "DD";
  onStartQuiz: (config: {
    documentId: string;
    competencyFracCode: string;
    questionCount: number;
    difficulty: number;
    bloomLevel: string;
  }) => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const selectClass = cn(
  "mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg transition-[border-color,box-shadow] duration-200 hover:border-fg-muted",
  focusRing
);

const labelClass = "text-xs font-medium text-fg-muted";

export function QuizGeneratorModal({
  isOpen,
  onClose,
  documents,
  competencies,
  cadreRank,
  onStartQuiz,
}: QuizGeneratorModalProps) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || "doc_plfs_2024");
  const [selectedCompetency, setSelectedCompetency] = useState(competencies[0]?.fracCode || "FN-STAT-014");
  const [questionCount] = useState(3);
  const [difficulty, setDifficulty] = useState(cadreRank === "DD" ? 5 : cadreRank === "SO" ? 4 : 3);
  const [bloomLevel, setBloomLevel] = useState("APPLY");
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-sync initial selection when modal opens or documents update
  useEffect(() => {
    if (isOpen && documents.length > 0) {
      const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
      setSelectedDocId(currentDoc.id);
      const mappedFrac = getCompetencyForDocument(currentDoc);
      if (competencies.some((c) => c.fracCode === mappedFrac)) {
        setSelectedCompetency(mappedFrac);
      }
    }
  }, [isOpen, documents]);

  const handleDocChange = (newDocId: string) => {
    setSelectedDocId(newDocId);
    const doc = documents.find((d) => d.id === newDocId);
    if (doc) {
      const mappedFrac = getCompetencyForDocument(doc);
      if (competencies.some((c) => c.fracCode === mappedFrac)) {
        setSelectedCompetency(mappedFrac);
      }
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsGenerating(false);
    onStartQuiz({
      documentId: selectedDocId,
      competencyFracCode: selectedCompetency,
      questionCount,
      difficulty,
      bloomLevel,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123158]/25 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-generator-title"
    >
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-surface text-fg shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
              Diagnostic assessment
            </p>
            <h2 id="quiz-generator-title" className="text-lg font-semibold tracking-tight text-fg">
              Generate a quiz from an ingested handbook
            </h2>
            <p className="text-xs text-fg-muted">
              Questions are grounded in MoSPI methodology and gated by Bloom&apos;s taxonomy.
            </p>
          </div>
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

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          <div>
            <label htmlFor="quiz-doc" className={labelClass}>
              Source handbook
            </label>
            <select
              id="quiz-doc"
              value={selectedDocId}
              onChange={(e) => handleDocChange(e.target.value)}
              className={selectClass}
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.chunkCount} chunks indexed)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quiz-competency" className={labelClass}>
              Target FRAC competency
            </label>
            <select
              id="quiz-competency"
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className={selectClass}
            >
              {competencies.map((comp) => (
                <option key={comp.fracCode} value={comp.fracCode}>
                  [{comp.fracCode}] {comp.label} (assessed {comp.current} / target {comp.target})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <fieldset>
              <legend className={labelClass}>Cadre difficulty (1–5)</legend>
              <div className="mt-2 grid grid-cols-5 gap-1.5" role="radiogroup">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const active = difficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDifficulty(lvl)}
                      className={cn(
                        "rounded-md border py-1.5 font-mono text-xs font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96]",
                        focusRing,
                        active
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-border bg-surface text-fg-muted hover:border-fg-muted hover:text-fg"
                      )}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-fg-muted">Cadre benchmark: {cadreRank} standard</p>
            </fieldset>

            <div>
              <label htmlFor="quiz-bloom" className={labelClass}>
                Bloom&apos;s cognitive level
              </label>
              <select
                id="quiz-bloom"
                value={bloomLevel}
                onChange={(e) => setBloomLevel(e.target.value)}
                className={selectClass}
              >
                <option value="REMEMBER">Remember — factual recall of guidelines</option>
                <option value="UNDERSTAND">Understand — conceptual interpretation</option>
                <option value="APPLY">Apply — operational sample calculations</option>
                <option value="ANALYZE">Analyse — defect and bias detection</option>
                <option value="EVALUATE">Evaluate — methodology critique</option>
              </select>
            </div>
          </div>

          <dl className="flex items-center justify-between gap-6 border-t border-border pt-4 text-xs text-fg-muted">
            <div className="flex items-baseline gap-1.5">
              <dt>Questions</dt>
              <dd className="font-mono font-medium text-fg">{questionCount} MCQs</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt>Time limit</dt>
              <dd className="font-mono font-medium text-fg">{questionCount * 2} min</dd>
            </div>
          </dl>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium text-fg-muted transition-colors duration-200 hover:bg-bg hover:text-fg active:scale-[0.98]",
              focusRing
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary hover:shadow-md active:translate-y-0 active:scale-[0.98] active:bg-primary/80 disabled:pointer-events-none disabled:opacity-50",
              focusRing
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                <span>Synthesising questions…</span>
              </>
            ) : (
              <>
                <span>Generate and begin</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
