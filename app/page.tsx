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
import { RoleLoginModal } from "@/components/auth/role-login-modal";
import { OfficerManagementView } from "@/components/views/admin/officer-management-view";
import { QuestionReviewView } from "@/components/views/admin/question-review-view";
import { AdminDocumentsView } from "@/components/views/admin/admin-documents-view";
import { AdminAnalyticsView } from "@/components/views/admin/admin-analytics-view";
import { RoleProvider, useRole, UserRole } from "@/lib/role-context";
import {
  FileUp,
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Layers,
  TrendingUp,
  FileQuestion,
  RotateCcw,
} from "lucide-react";
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
  ReviewableQuestion,
  getInitialReviewQuestions,
  registerDocumentQuestions,
  resolveQuestionsForQuiz,
} from "@/lib/data-service";

export default function HomePage() {
  return (
    <RoleProvider>
      <WorkspaceContent />
    </RoleProvider>
  );
}

function WorkspaceContent() {
  const {
    role,
    setRole,
    switchRole,
    currentOfficer,
    setCurrentOfficer,
    adminProfile,
    isLoginModalOpen,
    setIsLoginModalOpen,
  } = useRole();

  const [officerProficiencies, setOfficerProficiencies] = useState<Record<string, CompetencyItem[]>>(
    INITIAL_OFFICER_COMPETENCIES
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(PRELOADED_DOCUMENTS);
  const [recommendations, setRecommendations] = useState<IgotCourse[]>(IGOT_COURSE_CATALOG);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Human-in-the-Loop Question Review State
  const [reviewQuestions, setReviewQuestions] = useState<ReviewableQuestion[]>(getInitialReviewQuestions);

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

  // Switch role handler
  const handleSwitchToRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "TRAINING_ADMIN") {
      setActiveTab("admin-dashboard");
    } else {
      setActiveTab("dashboard");
    }
  };

  // Add document handler
  const handleDocumentAdded = (newDoc: DocumentItem) => {
    registerDocumentQuestions(newDoc);
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Question review handlers
  const handleApproveQuestion = (id: string) => {
    setReviewQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              reviewStatus: "APPROVED" as const,
              reviewedAt: "Just now (Approved by Dr. Rajiv Sen)",
              reviewerNotes: "Approved for cadre diagnostic examination and question bank inclusion.",
            }
          : q
      )
    );
  };

  const handleRejectQuestion = (id: string, reason?: string) => {
    setReviewQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              reviewStatus: "REJECTED" as const,
              reviewedAt: "Just now",
              reviewerNotes: reason || "Rejected by institutional reviewer. Excluded from quiz generation.",
            }
          : q
      )
    );
  };

  const handleEditQuestion = (updated: ReviewableQuestion) => {
    setReviewQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  const handleResetReviewQuestions = () => {
    setReviewQuestions(getInitialReviewQuestions());
  };

  // Start quiz from generator or shortcut — calls /api/assessment/generate with robust fallback
  const handleStartQuiz = async (config: {
    documentId: string;
    competencyFracCode: string;
    questionCount: number;
    difficulty: number;
    bloomLevel: string;
  }) => {
    let resolvedQuestions: AssessmentQuestion[] = [];

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
            resolvedQuestions = data.questions;
          }
        }
      }
    } catch (err) {
      console.warn("API generate fetch fallback:", err);
    }

    if (resolvedQuestions.length === 0) {
      resolvedQuestions = resolveQuestionsForQuiz({
        documentId: config.documentId,
        competencyFracCode: config.competencyFracCode,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        bloomLevel: config.bloomLevel,
      });
    }

    // If generated from Admin role, also ingest into Question Review pool with status "UNDER_REVIEW"
    if (role === "TRAINING_ADMIN") {
      const newReviewItems: ReviewableQuestion[] = resolvedQuestions.map((q) => ({
        ...q,
        reviewStatus: "UNDER_REVIEW" as const,
        reviewerNotes: `AI Generated from ${q.sourceDocument || "Manual"} for competency ${q.competencyFracCode}. Awaiting technical validation.`,
      }));
      setReviewQuestions((prev) => [...newReviewItems, ...prev]);
    }

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
    setOfficerProficiencies((prev) => {
      const officerList = prev[currentOfficer.id] || [];
      const updated = officerList.map((comp) => {
        if (comp.fracCode === result.competencyFracCode) {
          const newCurrent = Math.max(1, Math.min(5, comp.current + result.earnedProficiencyDelta));
          const deltaSign = result.earnedProficiencyDelta > 0 ? `+${result.earnedProficiencyDelta}` : `${result.earnedProficiencyDelta}`;
          const statusText = result.earnedProficiencyDelta !== 0
            ? `Just now (${result.scorePercent}% · ${deltaSign} level)`
            : `Just now (${result.scorePercent}% · Baseline unchanged)`;

          return {
            ...comp,
            current: newCurrent,
            lastAssessed: statusText,
          };
        }
        return comp;
      });
      return { ...prev, [currentOfficer.id]: updated };
    });
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

    setRecommendations((prev) =>
      prev.map((r) =>
        r.competencyFracCode === competencyFracCode ? { ...r, status: "COMPLETED" } : r
      )
    );
  };

  // Tab switcher that synchronizes roles when user navigates
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab.startsWith("admin-") || tab === "admin") {
      if (role !== "TRAINING_ADMIN") {
        setRole("TRAINING_ADMIN");
      }
    } else {
      if (role !== "OFFICER") {
        setRole("OFFICER");
      }
    }
  };

  const renderTabContent = () => {
    // ----------------------------------------------------
    // TRAINING ADMIN VIEWS
    // ----------------------------------------------------
    if (role === "TRAINING_ADMIN") {
      switch (activeTab) {
        case "admin-dashboard":
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

        case "admin-officers":
          return (
            <div className="space-y-6">
              <OfficerManagementView
                officers={DEMO_OFFICERS}
                officerProficiencies={officerProficiencies}
                onInspectOfficer={(off) => {
                  setCurrentOfficer(off);
                }}
              />
            </div>
          );

        case "admin-competencies":
          return (
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
                  Competency Heatmaps & Gap Analytics
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-fg">
                  Divisional FRAC Competency Gaps
                </h2>
                <p className="text-xs text-fg-muted">
                  Cross-divisional readiness deficits across NSSO FOD, NAD, ESD, and DQAD.
                </p>
              </div>
              <TdAdminDashboard />
            </div>
          );

        case "admin-documents":
          return (
            <div className="space-y-6">
              <AdminDocumentsView
                documents={documents}
                onDocumentAdded={handleDocumentAdded}
                onSelectForQuizGeneration={(doc) => {
                  setIsQuizGenOpen(true);
                }}
              />
            </div>
          );

        case "admin-quiz-gen":
          return (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>RAG Grounded Generation Pipeline</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-fg">
                      AI Diagnostic Quiz Generator
                    </h2>
                    <p className="mt-1.5 text-xs text-fg-muted max-w-xl">
                      Generate multi-level MCQs strictly grounded in uploaded MoSPI statistical manuals with exact page citations, Bloom&apos;s Taxonomy calibration, and automatic routing to the Human-in-the-Loop review pool.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuizGenOpen(true)}
                    className="primary-action self-start sm:self-auto gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Launch Generator</span>
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-slate-50/50 p-5">
                    <div className="flex items-center gap-2.5 text-primary font-semibold text-sm">
                      <Layers className="h-4 w-4" />
                      <span>1. Ingest Knowledge</span>
                    </div>
                    <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                      Select official documents like PLFS, SNA, CPI, or ASI manuals. Text is chunked and verified.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-slate-50/50 p-5">
                    <div className="flex items-center gap-2.5 text-indigo-600 font-semibold text-sm">
                      <Target className="h-4 w-4" />
                      <span>2. Calibrate Taxonomy</span>
                    </div>
                    <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                      Choose difficulty (1–5) and Bloom&apos;s level (Remember, Understand, Apply, Analyze, Evaluate) to target specific cadres.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-slate-50/50 p-5">
                    <div className="flex items-center gap-2.5 text-emerald-600 font-semibold text-sm">
                      <ShieldCheck className="h-4 w-4" />
                      <span>3. Human-in-the-Loop</span>
                    </div>
                    <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                      Every generated question enters the review queue for institutional approval before release to officers.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-fg">Institutional Question Review Studio</h4>
                      <p className="text-xs text-fg-muted">
                        Currently {reviewQuestions.filter((q) => q.reviewStatus === "UNDER_REVIEW").length} questions awaiting verification.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("admin-review")}
                    className="outline-action text-xs font-semibold gap-1.5 shrink-0"
                  >
                    <span>Go to Question Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );

        case "admin-review":
          return (
            <div className="space-y-6">
              <QuestionReviewView
                questions={reviewQuestions}
                onApproveQuestion={handleApproveQuestion}
                onRejectQuestion={handleRejectQuestion}
                onEditQuestion={handleEditQuestion}
                onResetAll={handleResetReviewQuestions}
              />
            </div>
          );

        case "admin-analytics":
          return (
            <div className="space-y-6">
              <AdminAnalyticsView />
            </div>
          );

        default:
          return (
            <div className="space-y-6">
              <TdAdminDashboard />
            </div>
          );
      }
    }

    // ----------------------------------------------------
    // CADRE OFFICER VIEWS
    // ----------------------------------------------------
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
          </>
        );

      case "assess":
      case "practice":
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
      case "competencies":
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
            {/* Source-Linked Manual Ingestion Section */}
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
              <details className="inline-ingestion" open>
                <summary>Or drop a file and explore preset manuals</summary>
                <DocumentDropzone onDocumentAdded={handleDocumentAdded} />
              </details>
            </section>

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
      case "progress":
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
    <div className={`workspace-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <Navbar
        officer={currentOfficer}
        competencies={currentCompetencies}
        recommendations={recommendations}
        documents={documents}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onStartAssessment={() => setIsQuizGenOpen(true)}
        onOpenDocUpload={() => setIsDocUploadOpen(true)}
        onTakeQuiz={handleTakeQuizForCompetency}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        role={role}
        onSwitchRole={() => handleSwitchToRole(role === "OFFICER" ? "TRAINING_ADMIN" : "OFFICER")}
        onOpenRoleModal={() => setIsLoginModalOpen(true)}
      />

      <main id="dashboard" className="workspace-main">
        <CadreProfileBar
          currentOfficer={currentOfficer}
          onSelectOfficer={handleSelectOfficer}
          competencies={currentCompetencies}
          activeView={role === "TRAINING_ADMIN" ? "TD_ADMIN" : "OFFICER"}
          onOpenQuizGenerator={() => setIsQuizGenOpen(true)}
          onOpenDocUpload={() => setIsDocUploadOpen(true)}
        />

        {renderTabContent()}

        <footer className="workspace-footer">
          MoSPI Statistical Capacity Building Platform <span>·</span> iGOT Karmayogi FRAC Alignment <span>·</span> NSSTA Training Directorate <span>·</span> <a href="/login" className="hover:underline text-primary font-medium inline-flex items-center gap-1">MoSPI SSO Login Portal <ArrowRight className="h-3 w-3" /></a>
        </footer>
      </main>

      {/* Role Switching Authentication Modal */}
      <RoleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSelectRole={handleSwitchToRole}
      />

      {/* Ingestion & Quiz Modals */}
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
        officerName={role === "TRAINING_ADMIN" ? "Dr. Rajiv Sen" : currentOfficer.name}
        cadreRank={role === "TRAINING_ADMIN" ? "HQ" : currentOfficer.cadreRank}
        onAssessmentCompleted={handleAssessmentCompleted}
      />
    </div>
  );
}
