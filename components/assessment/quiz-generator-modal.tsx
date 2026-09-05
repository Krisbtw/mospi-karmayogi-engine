"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Clock,
  Target,
} from "lucide-react";
import { DocumentItem, CompetencyItem } from "@/lib/data-service";

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
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState(cadreRank === "DD" ? 5 : cadreRank === "SO" ? 4 : 3);
  const [bloomLevel, setBloomLevel] = useState("APPLY");
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Diagnostic Quiz Generator</h2>
              <p className="text-xs text-slate-400">Grounded in MoSPI Methodologies with Bloom&apos;s Taxonomy Gating</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Source Handbook */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-sky-400" />
              <span>Grounded Handbook Context</span>
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} ({doc.chunkCount} chunks indexed)
                </option>
              ))}
            </select>
          </div>

          {/* Target FRAC Competency */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <span>Target FRAC Competency</span>
            </label>
            <select
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
            >
              {competencies.map((comp) => (
                <option key={comp.fracCode} value={comp.fracCode}>
                  [{comp.fracCode}] {comp.label} (Current: Lvl {comp.current} / Target: Lvl {comp.target})
                </option>
              ))}
            </select>
          </div>

          {/* Cadre Difficulty & Bloom Level */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-sky-400" />
                <span>Cadre Difficulty (Level 1–5)</span>
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      difficulty === lvl
                        ? "bg-sky-600 text-white shadow"
                        : "bg-slate-950/60 border border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Cadre benchmark: {cadreRank} standard</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bloom&apos;s Cognitive Level</span>
              </label>
              <select
                value={bloomLevel}
                onChange={(e) => setBloomLevel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="REMEMBER">Remember (Factual recall of guidelines)</option>
                <option value="UNDERSTAND">Understand (Conceptual interpretation)</option>
                <option value="APPLY">Apply (Operational sample calculations)</option>
                <option value="ANALYZE">Analyze (Defect & bias detection)</option>
                <option value="EVALUATE">Evaluate (Methodology critique)</option>
              </select>
            </div>
          </div>

          {/* Question Count and Estimated Time */}
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Question Count: <strong>{questionCount} MCQs</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Time Limit: <strong>{questionCount * 2} minutes</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-slate-950/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white shadow-md transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Synthesizing MCQs from chunks...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate & Begin Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
