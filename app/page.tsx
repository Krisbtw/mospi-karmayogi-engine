"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { CadreProfileBar } from "@/components/dashboard/cadre-profile-bar";
import { CompetencyRadarCard } from "@/components/dashboard/competency-radar-card";
import { CourseRecommendationsList } from "@/components/dashboard/course-recommendations-list";
import { MetricStrip } from "@/components/dashboard/metric-strip";
import { DocumentDropzone } from "@/components/documents/document-dropzone";
import { TdAdminDashboard } from "@/components/dashboard/td-admin-dashboard";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { QuizGeneratorModal } from "@/components/assessment/quiz-generator-modal";
import { QuizTakerModal } from "@/components/assessment/quiz-taker-modal";
import { FileUp } from "lucide-react";
import {
  Officer,
  DEMO_OFFICERS,
  INITIAL_OFFICER_COMPETENCIES,
  PRELOADED_DOCUMENTS,
  IGOT_COURSE_CATALOG,
  DocumentItem,
  AssessmentQuestion,
  CompetencyItem,
  IgotCourse,
  registerDocumentQuestions,
  resolveQuestionsForQuiz,
} from "@/lib/data-service";

export default function HomePage() {
  const [currentOfficer, setCurrentOfficer] = useState<Officer>(DEMO_OFFICERS[0]);
  const [officerProficiencies, setOfficerProficiencies] = useState<Record<string, CompetencyItem[]>>(
    INITIAL_OFFICER_COMPETENCIES
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(PRELOADED_DOCUMENTS);
  const [recommendations, setRecommendations] = useState<IgotCourse[]>(IGOT_COURSE_CATALOG);
  const [activeView, setActiveView] = useState<"OFFICER" | "TD_ADMIN">("OFFICER");

  // Modal states
  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [isQuizGenOpen, setIsQuizGenOpen] = useState(false);
  const [isQuizTakerOpen, setIsQuizTakerOpen] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<AssessmentQuestion[]>([]);

  // Current active competencies for selected officer
  const currentCompetencies = officerProficiencies[currentOfficer.id] || [];

  // Switch officer handler
  const handleSelectOfficer = (officer: Officer) => {
    setCurrentOfficer(officer);
  };

  // Add document handler
  const handleDocumentAdded = (newDoc: DocumentItem) => {
    registerDocumentQuestions(newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Start quiz from generator or shortcut — calls /api/assessment/generate with robust fallback
  const handleStartQuiz = async (config: {
    documentId: string;
    competencyFracCode: string;
    questionCount: number;
    difficulty: number;
    bloomLevel: string;
  }) => {
    try {
      const res = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: config.documentId,
          competencyFracCodes: [config.competencyFracCode],
          questionCount: config.questionCount,
          difficulty: config.difficulty,
          bloomLevel: config.bloomLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const hasMatchingCompetency = data.questions.some(
            (q: AssessmentQuestion) => q.competencyFracCode === config.competencyFracCode
          );
          if (hasMatchingCompetency) {
            setActiveQuestions(data.questions);
            setIsQuizTakerOpen(true);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("API generate fetch fallback:", err);
    }

    // Robust Grounded Fallback: guarantee competency match
    const resolvedQuestions = resolveQuestionsForQuiz({
      documentId: config.documentId,
      competencyFracCode: config.competencyFracCode,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
    });

    setActiveQuestions(resolvedQuestions);
    setIsQuizTakerOpen(true);
  };

  // Direct shortcut from radar chart
  const handleTakeQuizForCompetency = (fracCode: string) => {
    const resolved = resolveQuestionsForQuiz({
      competencyFracCode: fracCode,
      questionCount: 3,
    });
    setActiveQuestions(resolved);
    setIsQuizTakerOpen(true);
  };

  // Assessment completion handler (updates score & radar in real time)
  const handleAssessmentCompleted = (result: {
    scorePercent: number;
    competencyFracCode: string;
    passed: boolean;
    earnedProficiencyDelta: number;
  }) => {
    if (result.passed && result.earnedProficiencyDelta > 0) {
      setOfficerProficiencies((prev) => {
        const officerList = prev[currentOfficer.id] || [];
        const updated = officerList.map((comp) => {
          if (comp.fracCode === result.competencyFracCode) {
            return {
              ...comp,
              current: Math.min(comp.target, comp.current + result.earnedProficiencyDelta),
              lastAssessed: "Just now (Diagnostic Quiz)",
            };
          }
          return comp;
        });
        return { ...prev, [currentOfficer.id]: updated };
      });
    }
  };

  // iGOT Course Completion simulation (closes the gap in real time)
  const handleCourseCompleted = (competencyFracCode: string, courseTitle: string) => {
    setOfficerProficiencies((prev) => {
      const officerList = prev[currentOfficer.id] || [];
      const updated = officerList.map((comp) => {
        if (comp.fracCode === competencyFracCode) {
          return {
            ...comp,
            current: Math.min(comp.target, comp.current + 1),
            lastAssessed: `Just now (iGOT: ${courseTitle.slice(0, 24)}…)`,
          };
        }
        return comp;
      });
      return { ...prev, [currentOfficer.id]: updated };
    });

    // Update recommendation status
    setRecommendations((prev) =>
      prev.map((r) =>
        r.competencyFracCode === competencyFracCode ? { ...r, status: "COMPLETED" } : r
      )
    );
  };

  return (
    <div className="workspace-shell">
      <Navbar
        officer={currentOfficer}
        competencies={currentCompetencies}
        recommendations={recommendations}
        documents={documents}
        onStartAssessment={() => setIsQuizGenOpen(true)}
        onOpenDocUpload={() => setIsDocUploadOpen(true)}
        onShowOfficerView={() => setActiveView("OFFICER")}
        onTakeQuiz={handleTakeQuizForCompetency}
      />
      <main id="dashboard" className="workspace-main">
        <CadreProfileBar
          currentOfficer={currentOfficer}
          onSelectOfficer={handleSelectOfficer}
          competencies={currentCompetencies}
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenQuizGenerator={() => setIsQuizGenOpen(true)}
          onOpenDocUpload={() => setIsDocUploadOpen(true)}
        />
        {activeView === "OFFICER" ? (
          <>
            <HeroSection onOpenDocUpload={() => setIsDocUploadOpen(true)} onStartAssessment={() => setIsQuizGenOpen(true)} />
            <MetricStrip officer={currentOfficer} competencies={currentCompetencies} completedCoursesCount={recommendations.filter((r) => r.status === "COMPLETED").length} />
            <div className="overview-panels">
              <section id="skills" aria-label="Skills and gaps">
                <CompetencyRadarCard officerName={currentOfficer.name} cadreRank={currentOfficer.cadreRank} data={currentCompetencies} onTakeQuizForCompetency={handleTakeQuizForCompetency} />
              </section>
              <section id="learning-plan" aria-label="Learning plan">
                <CourseRecommendationsList
                  userId={currentOfficer.id}
                  recommendations={recommendations}
                  onSynced={(recId, nextStatus) => {
                    setRecommendations((prev) => prev.map((r) => (r.id === recId ? { ...r, status: nextStatus } : r)));
                  }}
                  onCourseCompleted={handleCourseCompleted}
                  onReassessCompetency={handleTakeQuizForCompetency}
                />
              </section>
            </div>
            <section id="manuals" className="upload-panel" aria-label="Manual ingestion">
              <div className="upload-callout">
                <span className="upload-callout-icon"><FileUp aria-hidden="true" /></span>
                <div><h2>Turn a manual into a source-linked quiz</h2><p>PDF, DOCX or TXT <span>·</span> Answers linked to the evidence</p></div>
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setIsDocUploadOpen(true)}
                >
                  Upload material
                </button>
              </div>
              <details className="inline-ingestion"><summary>Or drop a file and explore preset manuals</summary><DocumentDropzone onDocumentAdded={handleDocumentAdded} /></details>
            </section>
          </>
        ) : (
          <><MetricStrip officer={currentOfficer} competencies={currentCompetencies} completedCoursesCount={recommendations.filter((r) => r.status === "COMPLETED").length} /><TdAdminDashboard /></>
        )}
        <footer className="workspace-footer">Sample data <span>·</span> iGOT not connected</footer>
      </main>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isDocUploadOpen}
        onClose={() => setIsDocUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
        existingDocuments={documents}
      />

      <QuizGeneratorModal
        isOpen={isQuizGenOpen}
        onClose={() => setIsQuizGenOpen(false)}
        documents={documents}
        competencies={currentCompetencies}
        cadreRank={currentOfficer.cadreRank}
        onStartQuiz={handleStartQuiz}
      />

      <QuizTakerModal
        isOpen={isQuizTakerOpen}
        onClose={() => setIsQuizTakerOpen(false)}
        questions={activeQuestions}
        officerName={currentOfficer.name}
        cadreRank={currentOfficer.cadreRank}
        onAssessmentCompleted={handleAssessmentCompleted}
      />
    </div>
  );
}
