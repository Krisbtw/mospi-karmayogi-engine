"use client";

import { useState } from "react";
import { CompetencyItem, IgotCourse, DocumentItem, resolveQuestionsForQuiz, AssessmentQuestion } from "@/lib/data-service";

const PROFICIENCY_MAX = 5;

interface AssessViewProps {
  competencies: CompetencyItem[];
  officerName: string;
  cadreRank: string;
  documents: DocumentItem[];
  onStartQuiz: (questions: AssessmentQuestion[], competencyFracCode: string) => void;
}

export function AssessView({ competencies, officerName, cadreRank, documents, onStartQuiz }: AssessViewProps) {
  const [selectedCompetency, setSelectedCompetency] = useState(competencies[0]?.fracCode || "");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState(cadreRank === "DD" ? 5 : cadreRank === "SO" ? 4 : 3);
  const [isGenerating, setIsGenerating] = useState(false);

  const comp = competencies.find((c) => c.fracCode === selectedCompetency);

  const handleStart = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const questions = resolveQuestionsForQuiz({
      competencyFracCode: selectedCompetency,
      questionCount,
      difficulty,
    });
    setIsGenerating(false);
    onStartQuiz(questions, selectedCompetency);
  };

  return (
    <div className="assess-view">
      <div className="assess-header">
        <h2>Diagnostic Assessment</h2>
        <p>
          Assess your competency level with MCQs grounded in MoSPI training material.
          Results will update your proficiency scores.
        </p>
      </div>

      <div className="assess-form-grid">
        {/* Left: Form */}
        <div className="assess-form-card">
          <div className="assess-field">
            <label htmlFor="assess-competency">Target competency</label>
            <select
              id="assess-competency"
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
            >
              {competencies.map((c) => (
                <option key={c.fracCode} value={c.fracCode}>
                  {c.label} (Current: {c.current}/{PROFICIENCY_MAX}, Target: {c.target}/{PROFICIENCY_MAX})
                </option>
              ))}
            </select>
          </div>

          <div className="assess-field">
            <label htmlFor="assess-difficulty">Difficulty level</label>
            <select
              id="assess-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            >
              <option value={1}>Level 1 — Foundational (Definitions & Terminology)</option>
              <option value={2}>Level 2 — Basic Operations (Core Concepts & Standards)</option>
              <option value={3}>Level 3 — Intermediate (JSO Cadre Benchmark)</option>
              <option value={4}>Level 4 — Advanced (SO Cadre Analytics)</option>
              <option value={5}>Level 5 — Expert (DD / Director Methodology)</option>
            </select>
          </div>

          <div className="assess-field">
            <label htmlFor="assess-count">Number of questions</label>
            <select
              id="assess-count"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              <option value={3}>3 questions (~6 min)</option>
              <option value={5}>5 questions (~10 min)</option>
              <option value={10}>10 questions (~20 min)</option>
            </select>
          </div>

          <button
            className="assess-start-btn"
            onClick={handleStart}
            disabled={isGenerating || !selectedCompetency}
          >
            {isGenerating ? "Generating…" : "Start Assessment"}
          </button>
        </div>

        {/* Right: Competency Info */}
        {comp && (
          <div className="assess-info-card">
            <h3>{comp.label}</h3>
            <p className="assess-info-desc">{comp.description}</p>
            <div className="assess-info-stats">
              <div>
                <span className="assess-stat-label">Current Level</span>
                <span className="assess-stat-value">{comp.current}/{PROFICIENCY_MAX}</span>
              </div>
              <div>
                <span className="assess-stat-label">Required Level</span>
                <span className="assess-stat-value">{comp.target}/{PROFICIENCY_MAX}</span>
              </div>
              <div>
                <span className="assess-stat-label">Gap</span>
                <span className="assess-stat-value">
                  {comp.target - comp.current > 0
                    ? `−${comp.target - comp.current} levels`
                    : "✓ Met"}
                </span>
              </div>
              <div>
                <span className="assess-stat-label">FRAC Code</span>
                <span className="assess-stat-value">{comp.fracCode}</span>
              </div>
              <div>
                <span className="assess-stat-label">Category</span>
                <span className="assess-stat-value">{comp.category}</span>
              </div>
              <div>
                <span className="assess-stat-label">Last Assessed</span>
                <span className="assess-stat-value">{comp.lastAssessed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
