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
import {
  Officer,
  DEMO_OFFICERS,
  INITIAL_OFFICER_COMPETENCIES,
  PRELOADED_DOCUMENTS,
  IGOT_COURSE_CATALOG,
  SAMPLE_QUESTIONS_DATABASE,
  DocumentItem,
  AssessmentQuestion,
  CompetencyItem,
  IgotCourse,
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setActiveQuestions(data.questions);
          setIsQuizTakerOpen(true);
          return;
        }
      }
    } catch (err) {
      console.warn("API generate fetch fallback:", err);
    }

    // Offline / Instant Fallback
    const pool =
      SAMPLE_QUESTIONS_DATABASE[config.documentId] ||
      SAMPLE_QUESTIONS_DATABASE["doc_plfs_2024"] ||
      Object.values(SAMPLE_QUESTIONS_DATABASE).flat();

    const matching = pool.filter(
      (q) => q.competencyFracCode === config.competencyFracCode
    );

    const questionsToUse = matching.length > 0 ? matching : pool;
    setActiveQuestions(questionsToUse.slice(0, config.questionCount));
    setIsQuizTakerOpen(true);
  };

  // Direct shortcut from radar chart
  const handleTakeQuizForCompetency = (fracCode: string) => {
    const pool = Object.values(SAMPLE_QUESTIONS_DATABASE).flat();
    const matching = pool.filter((q) => q.competencyFracCode === fracCode);
    const questionsToUse = matching.length > 0 ? matching : pool.slice(0, 3);
    setActiveQuestions(questionsToUse);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400/30">
      <Navbar />

      <main>
        {/* Landing Hero with ambient WebGL shader background */}
        <HeroSection onOpenDocUpload={() => setIsDocUploadOpen(true)} />

        {/* Dashboard Section */}
        <section
          id="dashboard"
          className="mx-auto flex max-w-[1320px] flex-col gap-14 px-6 py-20 scroll-mt-16 lg:px-10 lg:py-24"
        >
          {/* Officer Cadre Bar & Switcher */}
          <CadreProfileBar
            currentOfficer={currentOfficer}
            onSelectOfficer={handleSelectOfficer}
            competencies={currentCompetencies}
            activeView={activeView}
            onChangeView={setActiveView}
            onOpenQuizGenerator={() => setIsQuizGenOpen(true)}
            onOpenDocUpload={() => setIsDocUploadOpen(true)}
          />

          {/* Metric ledger */}
          <MetricStrip
            officer={currentOfficer}
            competencies={currentCompetencies}
            completedCoursesCount={recommendations.filter((r) => r.status === "COMPLETED").length}
          />

          {/* Conditional View: Cadre Officer vs Training Division Admin */}
          {activeView === "OFFICER" ? (
            <div className="flex flex-col gap-14">
              {/* Asymmetric split: radar takes 5/12, course list takes 7/12 */}
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <CompetencyRadarCard
                    officerName={currentOfficer.name}
                    cadreRank={currentOfficer.cadreRank}
                    data={currentCompetencies}
                    onTakeQuizForCompetency={handleTakeQuizForCompetency}
                  />
                </div>

                <div className="lg:col-span-7">
                  <CourseRecommendationsList
                    userId={currentOfficer.id}
                    recommendations={recommendations}
                    onCourseCompleted={handleCourseCompleted}
                  />
                </div>
              </div>

              {/* Statistical Guideline RAG Ingestion Dropzone */}
              <DocumentDropzone onDocumentAdded={handleDocumentAdded} />
            </div>
          ) : (
            /* Training Division Admin Dashboard */
            <TdAdminDashboard />
          )}
        </section>
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
