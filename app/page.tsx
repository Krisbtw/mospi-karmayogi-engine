"use client";

import { useState } from "react";
import { Navbar, NavTab } from "@/components/navbar";
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
import { GapAnalysisView } from "@/components/views/gap-analysis-view";
import { AssessView } from "@/components/views/assess-view";
import { HistoryView } from "@/components/views/history-view";
import { ProfileView } from "@/components/views/profile-view";
import { FileUp, Sparkles, BookOpen, Target, ArrowRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

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

    // Robust Grounded Fallback: guarantee competency match, difficulty escalation, and exact count
    const resolvedQuestions = resolveQuestionsForQuiz({
      documentId: config.documentId,
      competencyFracCode: config.competencyFracCode,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
      bloomLevel: config.bloomLevel,
    });

    setActiveQuestions(resolvedQuestions);
    setIsQuizTakerOpen(true);
  };

  // Direct shortcut from radar chart
  const handleTakeQuizForCompetency = (fracCode: string) => {
    const defaultDiff = currentOfficer.cadreRank === "DD" ? 5 : currentOfficer.cadreRank === "SO" ? 4 : 3;
    const resolved = resolveQuestionsForQuiz({
      competencyFracCode: fracCode,
      questionCount: 5,
      difficulty: defaultDiff,
    });
    setActiveQuestions(resolved);
    setIsQuizTakerOpen(true);
  };

  // Start quiz from Assess view
  const handleAssessStartQuiz = (questions: AssessmentQuestion[], competencyFracCode: string) => {
    setActiveQuestions(questions);
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
    // Navigate directly to Gap Analysis view after updating competency profile
    setActiveTab("gap-analysis");
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <HeroSection
              onOpenDocUpload={() => setIsDocUploadOpen(true)}
              onStartAssessment={() => setIsQuizGenOpen(true)}
            />
            <MetricStrip
              officer={currentOfficer}
              competencies={currentCompetencies}
              completedCoursesCount={recommendations.filter((r) => r.status === "COMPLETED").length}
            />
            <div className="overview-panels">
              <section id="skills" aria-label="Skills and gaps">
                <CompetencyRadarCard
                  officerName={currentOfficer.name}
                  cadreRank={currentOfficer.cadreRank}
                  data={currentCompetencies}
                  onTakeQuizForCompetency={handleTakeQuizForCompetency}
                />
              </section>
              <section id="learning-plan" aria-label="Learning plan">
                <CourseRecommendationsList
                  userId={currentOfficer.id}
                  officer={currentOfficer}
                  competencies={currentCompetencies}
                  recommendations={recommendations}
                  defaultShowAll={false}
                  initialCount={2}
                  onSynced={(recId, nextStatus) => {
                    setRecommendations((prev) =>
                      prev.map((r) => (r.id === recId ? { ...r, status: nextStatus } : r))
                    );
                  }}
                  onCourseCompleted={handleCourseCompleted}
                  onReassessCompetency={handleTakeQuizForCompetency}
                />
              </section>
            </div>
            <section id="manuals" className="upload-panel" aria-label="Manual ingestion">
              <div className="upload-callout">
                <span className="upload-callout-icon">
                  <FileUp aria-hidden="true" />
                </span>
                <div>
                  <h2>Turn a manual into a source-linked quiz</h2>
                  <p>
                    PDF, DOCX or TXT <span>·</span> Answers linked to the evidence
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setIsDocUploadOpen(true)}
                >
                  Upload material
                </button>
              </div>
              <details className="inline-ingestion">
                <summary>Or drop a file and explore preset manuals</summary>
                <DocumentDropzone onDocumentAdded={handleDocumentAdded} />
              </details>
            </section>
          </>
        );

      case "assess":
        return (
          <div className="space-y-6">
            <AssessView
              competencies={currentCompetencies}
              officerName={currentOfficer.name}
              cadreRank={currentOfficer.cadreRank}
              documents={documents}
              onStartQuiz={handleAssessStartQuiz}
            />
          </div>
        );

      case "gap-analysis":
        return (
          <div className="space-y-6">
            <GapAnalysisView
              officer={currentOfficer}
              competencies={currentCompetencies}
              officerName={currentOfficer.name}
              cadreRank={currentOfficer.cadreRank}
              onTakeQuiz={handleTakeQuizForCompetency}
              onTakeAnotherQuiz={() => setIsQuizGenOpen(true)}
              onGoToLearningPath={() => setActiveTab("learning-path")}
            />
          </div>
        );

      case "learning-path":
        return (
          <div className="space-y-6">
            <div className="section-header">
              <h2>iGOT Karmayogi Learning Path & Curated Courses</h2>
              <p>Tailored courses aligned to your MoSPI FRAC competency benchmarks.</p>
            </div>
            <CourseRecommendationsList
              userId={currentOfficer.id}
              officer={currentOfficer}
              competencies={currentCompetencies}
              recommendations={recommendations}
              defaultShowAll={true}
              initialCount={10}
              onSynced={(recId, nextStatus) => {
                setRecommendations((prev) =>
                  prev.map((r) => (r.id === recId ? { ...r, status: nextStatus } : r))
                );
              }}
              onCourseCompleted={handleCourseCompleted}
              onReassessCompetency={handleTakeQuizForCompetency}
            />
          </div>
        );

      case "quiz-studio":
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-fg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quiz Studio
                  </h2>
                  <p className="text-sm text-fg-muted mt-1">
                    AI-powered diagnostic quiz generator grounded in MoSPI manuals and FRAC competencies.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setIsQuizGenOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  Launch Quiz Generator
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCompetencies.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex flex-col justify-between rounded-lg border border-border/80 bg-slate-50/50 p-4 hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <span className="text-[11px] font-mono text-primary font-medium">
                        {comp.fracCode}
                      </span>
                      <h3 className="font-semibold text-sm text-fg mt-1">{comp.label}</h3>
                      <p className="text-xs text-fg-muted mt-1">
                        Current: Level {comp.current}/5 · Target: Level {comp.target}/5
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTakeQuizForCompetency(comp.fracCode)}
                      className="outline-action mt-4 self-start"
                    >
                      <Target className="h-3.5 w-3.5" />
                      Take 5-Question Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="space-y-6">
            <HistoryView
              competencies={currentCompetencies}
              recommendations={recommendations}
              officerName={currentOfficer.name}
              cadreRank={currentOfficer.cadreRank}
            />
          </div>
        );

      case "admin":
        return (
          <div className="space-y-6">
            <MetricStrip
              officer={currentOfficer}
              competencies={currentCompetencies}
              completedCoursesCount={recommendations.filter((r) => r.status === "COMPLETED").length}
            />
            <TdAdminDashboard />
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <ProfileView
              officer={currentOfficer}
              competencies={currentCompetencies}
              onSelectOfficer={handleSelectOfficer}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="workspace-shell">
      <Navbar
        officer={currentOfficer}
        competencies={currentCompetencies}
        recommendations={recommendations}
        documents={documents}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartAssessment={() => setIsQuizGenOpen(true)}
        onOpenDocUpload={() => setIsDocUploadOpen(true)}
        onTakeQuiz={handleTakeQuizForCompetency}
      />

      <main id="dashboard" className="workspace-main">
        <CadreProfileBar
          currentOfficer={currentOfficer}
          onSelectOfficer={handleSelectOfficer}
          competencies={currentCompetencies}
          activeView={activeTab === "admin" ? "TD_ADMIN" : "OFFICER"}
          onChangeView={(view) => {
            if (view === "TD_ADMIN") {
              setActiveTab("admin");
            } else {
              setActiveTab("dashboard");
            }
          }}
          onOpenQuizGenerator={() => setIsQuizGenOpen(true)}
          onOpenDocUpload={() => setIsDocUploadOpen(true)}
        />

        {renderTabContent()}

        <footer className="workspace-footer">
          Sample data <span>·</span> iGOT not connected
        </footer>
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
