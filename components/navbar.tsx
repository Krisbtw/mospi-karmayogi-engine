"use client";

import { useEffect, useState } from "react";
import { Home, Target, CalendarDays, FileQuestion, Radio, CircleHelp, Search, Menu, X, Bell, ArrowRight } from "lucide-react";
import { Officer, CompetencyItem, IgotCourse, DocumentItem } from "@/lib/data-service";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NavbarProps {
  officer: Officer;
  competencies: CompetencyItem[];
  recommendations: IgotCourse[];
  documents: DocumentItem[];
  onStartAssessment: () => void;
  onOpenDocUpload: () => void;
  onShowOfficerView: () => void;
  onTakeQuiz: (code: string) => void;
}

export function Navbar({ officer, competencies, recommendations, documents, onStartAssessment, onOpenDocUpload, onShowOfficerView, onTakeQuiz }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("Learning plan");
  const [query, setQuery] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const motionReduced = reducedMotion || systemReducedMotion;

  useEffect(() => {
    const syncActiveSection = () => {
      const section = window.location.hash;
      setActive(section === "#dashboard" ? "Overview" : section === "#skills" ? "Skills & gaps" : "Learning plan");
    };
    syncActiveSection();
    window.addEventListener("hashchange", syncActiveSection);
    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncSystemPreference = () => setSystemReducedMotion(preference.matches);
    setReducedMotion(document.documentElement.dataset.reduceMotion === "true");
    syncSystemPreference();
    preference.addEventListener("change", syncSystemPreference);
    return () => preference.removeEventListener("change", syncSystemPreference);
  }, []);

  const navigate = (label: string) => {
    setActive(label);
    setMenuOpen(false);
    onShowOfficerView();
  };
  const searchItems = [
    ...competencies.map((item) => ({ id: item.id, title: item.label, type: "Skill", action: () => onTakeQuiz(item.fracCode) })),
    ...recommendations.map((item) => ({ id: item.id, title: item.courseTitle, type: "Course", action: () => { onShowOfficerView(); window.location.hash = "learning-plan"; } })),
    ...documents.map((item) => ({ id: item.id, title: item.title, type: "Manual", action: onOpenDocUpload })),
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase().trim()));

  return (
    <>
      <a className="skip-link" href="#dashboard">Skip to workspace</a>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside id="workspace-navigation" className={`workspace-sidebar ${menuOpen ? "is-open" : ""}`}>
        <a href="#dashboard" className="workspace-brand" onClick={() => navigate("Overview")}>
          <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
            <path d="m18 2 6 5-6 5-6-5Z" fill="#135071" />
            <path d="M3 10 16 16v16L3 24Z" fill="#009f9b" />
            <path d="m33 10-13 6v16l13-8Z" fill="#087a83" />
            <path d="m16 16 2 5 2-5v16l-2 2-2-2Z" fill="#40c8bc" />
          </svg>
          <span><strong>Karmayogi Engine</strong><small>STATISTICS LEARNING</small></span>
        </a>
        <nav aria-label="Primary" className="workspace-nav">
          <a className={active === "Overview" ? "is-active" : ""} aria-current={active === "Overview" ? "location" : undefined} href="#dashboard" onClick={() => navigate("Overview")}><Home /><span>Overview</span></a>
          <a className={active === "Skills & gaps" ? "is-active" : ""} aria-current={active === "Skills & gaps" ? "location" : undefined} href="#skills" onClick={() => navigate("Skills & gaps")}><Target /><span>Skills &amp; gaps</span></a>
          <a className={active === "Learning plan" ? "is-active" : ""} aria-current={active === "Learning plan" ? "location" : undefined} href="#learning-plan" onClick={() => navigate("Learning plan")}><CalendarDays /><span>Learning plan</span></a>
          <button onClick={() => { setMenuOpen(false); onStartAssessment(); }}><FileQuestion /><span>Quiz Studio</span></button>
        </nav>
        <div className="sidebar-utilities">
          <button className="motion-control" role="switch" aria-checked={motionReduced} disabled={systemReducedMotion} title={systemReducedMotion ? "Enabled by your device’s reduced-motion setting" : "Reduce transitions and smooth scrolling"} onClick={() => {
            const next = !reducedMotion;
            setReducedMotion(next);
            document.documentElement.dataset.reduceMotion = String(next);
          }}><Radio /><span>Reduce motion</span><span className={`small-switch ${motionReduced ? "is-on" : ""}`} aria-hidden="true" /></button>
          <DropdownMenu>
            <DropdownMenuTrigger className="sidebar-help"><CircleHelp /><span>Help &amp; support</span></DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-72">
              <DropdownMenuLabel>Make your next step count</DropdownMenuLabel>
              <p className="px-2 py-2 text-xs leading-relaxed text-fg-muted">Assess a skill, enrol in a recommended course, then re-assess to see your progress. Upload a manual to create source-linked questions.</p>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { setMenuOpen(false); onStartAssessment(); }}>Start a diagnostic assessment <ArrowRight className="ml-auto h-3 w-3" /></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setMenuOpen(false); onOpenDocUpload(); }}>Browse manuals and upload material</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <header className="workspace-topbar">
        <button className="mobile-menu icon-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="workspace-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <div className="workspace-breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{active}</strong></div>
        <div className="workspace-search">
          <Search aria-hidden="true" />
          <input aria-label="Search skills, courses or manuals" placeholder="Search skills, courses or manuals" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} />
          {query.trim() && <div className="search-results" aria-label="Search results">
            {searchItems.length ? searchItems.map((item) => <button key={`${item.type}-${item.id}`} onClick={() => { item.action(); setQuery(""); }}><small>{item.type}</small><span>{item.title}</span><ArrowRight aria-hidden="true" /></button>) : <p>No matching skills, courses or manuals.</p>}
          </div>}
        </div>
        <div className="topbar-actions">
          <DropdownMenu>
            <DropdownMenuTrigger className="icon-button notification-button" aria-label="Workspace updates"><Bell /><span /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Workspace updates</DropdownMenuLabel>
              <p className="px-2 py-2 text-xs leading-relaxed text-fg-muted">{documents.filter((document) => document.status === "READY").length} manuals are ready for source-linked assessments.</p>
              <DropdownMenuItem onSelect={onOpenDocUpload}>View manual library <ArrowRight className="ml-auto h-3 w-3" /></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="officer-avatar" aria-label={`Profile: ${officer.name}`}>{officer.avatar}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>{officer.name}</DropdownMenuLabel>
              <div className="px-2 py-2 text-xs leading-relaxed text-fg-muted"><p>{officer.designation}</p><p>{officer.division}</p><p>{officer.region}</p><p className="mt-2">iGOT ID: {officer.igotUserId}</p></div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { window.setTimeout(() => document.getElementById("officer-switcher")?.focus(), 0); }}>Switch officer or workspace view</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
