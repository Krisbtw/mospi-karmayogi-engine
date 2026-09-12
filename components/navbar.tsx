"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Target,
  BarChart3,
  BookOpen,
  FileQuestion,
  History,
  ShieldCheck,
  User,
  Radio,
  CircleHelp,
  Search,
  Menu,
  X,
  Bell,
  ArrowRight,
  Users,
  Layers,
  TrendingUp,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Officer, CompetencyItem, IgotCourse, DocumentItem } from "@/lib/data-service";
import { UserRole } from "@/lib/role-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type NavTab =
  // Officer tabs
  | "dashboard"
  | "competencies"
  | "learning-path"
  | "practice"
  | "progress"
  | "profile"
  // Legacy aliases
  | "assess"
  | "gap-analysis"
  | "quiz-studio"
  | "history"
  // Admin tabs
  | "admin-dashboard"
  | "admin-officers"
  | "admin-competencies"
  | "admin-documents"
  | "admin-quiz-gen"
  | "admin-review"
  | "admin-analytics"
  | "admin";

interface NavbarProps {
  officer: Officer;
  competencies: CompetencyItem[];
  recommendations: IgotCourse[];
  documents: DocumentItem[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onStartAssessment: () => void;
  onOpenDocUpload: () => void;
  onTakeQuiz: (code: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  role?: UserRole;
  onSwitchRole?: () => void;
  onOpenRoleModal?: () => void;
}

const OFFICER_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "assess", label: "Assess", icon: Target },
  { id: "gap-analysis", label: "Gap Analysis", icon: BarChart3 },
  { id: "learning-path", label: "Learning Path", icon: BookOpen },
  { id: "quiz-studio", label: "Quiz Studio", icon: FileQuestion },
  { id: "history", label: "History", icon: History },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "profile", label: "Profile", icon: User },
];

const ADMIN_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "admin-dashboard", label: "Dashboard", icon: Home },
  { id: "admin-officers", label: "Officers", icon: Users },
  { id: "admin-competencies", label: "Competency Analytics", icon: BarChart3 },
  { id: "admin-documents", label: "Documents", icon: Layers },
  { id: "admin-quiz-gen", label: "AI Quiz Generator", icon: Sparkles },
  { id: "admin-review", label: "Question Review", icon: ShieldCheck },
  { id: "admin-analytics", label: "Learning Analytics", icon: TrendingUp },
  { id: "dashboard", label: "Officer View", icon: User },
];

export function Navbar({
  officer,
  competencies,
  recommendations,
  documents,
  activeTab,
  onTabChange,
  onStartAssessment,
  onOpenDocUpload,
  onTakeQuiz,
  sidebarCollapsed = false,
  onToggleSidebar,
  role = "OFFICER",
  onSwitchRole,
  onOpenRoleModal,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const motionReduced = reducedMotion || systemReducedMotion;

  const navItems = role === "TRAINING_ADMIN" ? ADMIN_NAV_ITEMS : OFFICER_NAV_ITEMS;

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 900) {
      setMenuOpen((prev) => !prev);
    } else if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      setMenuOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncSystemPreference = () => setSystemReducedMotion(preference.matches);
    setReducedMotion(document.documentElement.dataset.reduceMotion === "true");
    syncSystemPreference();
    preference.addEventListener("change", syncSystemPreference);
    return () => preference.removeEventListener("change", syncSystemPreference);
  }, []);

  const handleNavClick = (id: NavTab) => {
    setMenuOpen(false);
    onTabChange(id);
    if (id === "quiz-studio") {
      onStartAssessment();
    }
  };

  const currentLabel =
    navItems.find((item) => item.id === activeTab)?.label ||
    (activeTab === "assess"
      ? "Assess"
      : activeTab === "gap-analysis"
      ? "Gap Analysis"
      : activeTab === "quiz-studio"
      ? "Quiz Studio"
      : activeTab === "history"
      ? "History"
      : activeTab === "admin"
      ? "Admin"
      : "Dashboard");

  const searchItems = [
    ...competencies.map((item) => ({
      id: item.id,
      title: item.label,
      type: "Skill" as const,
      action: () => onTakeQuiz(item.fracCode),
    })),
    ...recommendations.map((item) => ({
      id: item.id,
      title: item.courseTitle,
      type: "Course" as const,
      action: () => onTabChange("learning-path"),
    })),
    ...documents.map((item) => ({
      id: item.id,
      title: item.title,
      type: "Manual" as const,
      action: onOpenDocUpload,
    })),
  ].filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <>
      <a className="skip-link" href="#dashboard">
        Skip to workspace
      </a>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}
      >
        <div className="flex items-center justify-between min-h-[74px] pr-2">
          <a
            href="#dashboard"
            className="workspace-brand flex-1"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(role === "TRAINING_ADMIN" ? "admin-dashboard" : "dashboard");
            }}
          >
            <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
              <path d="m18 2 6 5-6 5-6-5Z" fill="#135071" />
              <path d="M3 10 16 16v16L3 24Z" fill="#009f9b" />
              <path d="m33 10-13 6v16l13-8Z" fill="#087a83" />
              <path d="m16 16 2 5 2-5v16l-2 2-2-2Z" fill="#40c8bc" />
            </svg>
            <span>
              <strong>Karmayogi Engine</strong>
              <small>{role === "OFFICER" ? "STATISTICS LEARNING" : "TRAINING DIVISION ADMIN"}</small>
            </span>
          </a>
          <button
            type="button"
            className="mobile-menu icon-button text-slate-500 hover:text-slate-900 rounded-lg p-1.5"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Primary" className="workspace-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "admin" && (activeTab === "admin" || activeTab.startsWith("admin-"))) ||
              (item.id === "admin-dashboard" && activeTab === "admin");

            return (
              <button
                key={item.id}
                type="button"
                className={isActive ? "is-active" : ""}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-utilities">
          <button
            className="motion-control"
            role="switch"
            aria-checked={motionReduced}
            disabled={systemReducedMotion}
            title={
              systemReducedMotion
                ? "Enabled by your device’s reduced-motion setting"
                : "Reduce transitions and smooth scrolling"
            }
            onClick={() => {
              const next = !reducedMotion;
              setReducedMotion(next);
              document.documentElement.dataset.reduceMotion = String(next);
            }}
          >
            <Radio />
            <span>Reduce motion</span>
            <span
              className={`small-switch ${motionReduced ? "is-on" : ""}`}
              aria-hidden="true"
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="sidebar-help">
              <CircleHelp />
              <span>Help &amp; support</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-72">
              <DropdownMenuLabel>Make your next step count</DropdownMenuLabel>
              <p className="px-2 py-2 text-xs leading-relaxed text-fg-muted">
                Assess a skill, enrol in a recommended course, then re-assess to
                see your progress. Upload a manual to create source-linked
                questions.
              </p>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setMenuOpen(false);
                  onStartAssessment();
                }}
              >
                Start a diagnostic assessment{" "}
                <ArrowRight className="ml-auto h-3 w-3" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setMenuOpen(false);
                  onOpenDocUpload();
                }}
              >
                Browse manuals and upload material
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <header className="workspace-topbar">
        <button
          className="sidebar-toggle-btn icon-button text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md p-1.5 transition-colors dark:text-slate-300 dark:hover:text-white"
          aria-label={menuOpen || !sidebarCollapsed ? "Toggle navigation sidebar" : "Expand navigation sidebar"}
          aria-expanded={menuOpen || !sidebarCollapsed}
          aria-controls="workspace-navigation"
          title="Toggle navigation sidebar (3 bars)"
          onClick={handleToggleSidebar}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="workspace-breadcrumb">
          <span>Workspace</span>
          <span aria-hidden="true">/</span>
          <strong>{currentLabel}</strong>
        </div>

        <div className="workspace-search">
          <Search aria-hidden="true" />
          <input
            aria-label="Search skills, courses or manuals"
            placeholder="Search skills, courses or manuals"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          {query.trim() && (
            <div className="search-results" aria-label="Search results">
              {searchItems.length ? (
                searchItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      item.action();
                      setQuery("");
                    }}
                  >
                    <small>{item.type}</small>
                    <span>{item.title}</span>
                    <ArrowRight aria-hidden="true" />
                  </button>
                ))
              ) : (
                <p>No matching skills, courses or manuals.</p>
              )}
            </div>
          )}
        </div>

        <div className="topbar-actions">
          {/* Persona / Role Switcher Pill */}
          <button
            type="button"
            id="role-switch-button"
            onClick={onOpenRoleModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: role === "TRAINING_ADMIN" ? "rgba(99, 102, 241, 0.12)" : "rgba(0, 159, 155, 0.12)",
              borderColor: role === "TRAINING_ADMIN" ? "rgba(99, 102, 241, 0.35)" : "rgba(0, 159, 155, 0.35)",
              color: role === "TRAINING_ADMIN" ? "#4338ca" : "#007f7c",
            }}
            title="Click to switch between Cadre Officer and Training Division Admin"
          >
            {role === "TRAINING_ADMIN" ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline font-bold">Training Admin</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  NSSTA HQ
                </span>
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline font-bold">Cadre Officer</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-800 dark:text-teal-200">
                  {officer.cadreRank}
                </span>
              </>
            )}
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 pl-1 border-l border-slate-300 dark:border-slate-700">
              Switch
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="icon-button notification-button"
              aria-label="Workspace updates"
            >
              <Bell />
              <span />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Workspace updates</DropdownMenuLabel>
              <p className="px-2 py-2 text-xs leading-relaxed text-fg-muted">
                {
                  documents.filter((document) => document.status === "READY")
                    .length
                }{" "}
                manuals are ready for source-linked assessments.
              </p>
              <DropdownMenuItem onSelect={onOpenDocUpload}>
                View manual library <ArrowRight className="ml-auto h-3 w-3" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="officer-avatar"
              aria-label={`Profile: ${officer.name}`}
            >
              {role === "TRAINING_ADMIN" ? "RS" : officer.avatar}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                {role === "TRAINING_ADMIN" ? "Dr. Rajiv Sen" : officer.name}
              </DropdownMenuLabel>
              <div className="px-2 py-2 text-xs leading-relaxed text-fg-muted">
                <p>
                  {role === "TRAINING_ADMIN"
                    ? "Director of Training (National Academy)"
                    : officer.designation}
                </p>
                <p>
                  {role === "TRAINING_ADMIN"
                    ? "NSSTA · Training Division, MoSPI"
                    : officer.division}
                </p>
                {role === "OFFICER" && <p>{officer.region}</p>}
                <p className="mt-2">
                  Role:{" "}
                  <strong className="text-primary font-semibold">
                    {role === "TRAINING_ADMIN" ? "Training Division Admin" : "MoSPI Cadre Officer"}
                  </strong>
                </p>
              </div>
              <DropdownMenuSeparator />
              {role === "OFFICER" && (
                <DropdownMenuItem onSelect={() => onTabChange("profile")}>
                  View Employee Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onOpenRoleModal}>
                <div className="flex items-center justify-between w-full">
                  <span>Switch Platform Persona</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {role === "OFFICER" ? "Go to Admin" : "Go to Officer"}
                  </span>
                </div>
              </DropdownMenuItem>
              {role === "OFFICER" && (
                <DropdownMenuItem
                  onSelect={() => {
                    window.setTimeout(
                      () => document.getElementById("officer-switcher")?.focus(),
                      0
                    );
                  }}
                >
                  Switch officer or workspace view
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
