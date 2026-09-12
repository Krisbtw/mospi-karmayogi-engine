"use client";

import { Officer, CompetencyItem, DEMO_OFFICERS } from "@/lib/data-service";
import { GraduationCap, Briefcase, MapPin, CalendarDays, BookOpen, ChevronRight, Award, Star, TrendingUp, Users } from "lucide-react";

interface ProfileViewProps {
  officer: Officer;
  competencies: CompetencyItem[];
  onSelectOfficer: (officer: Officer) => void;
}

const PROFICIENCY_MAX = 5;

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  FUNCTIONAL:   { label: "Statistical",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  DOMAIN:       { label: "Statistical",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  TECHNICAL:    { label: "Technical",         color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  DIGITAL_GOV:  { label: "Digital Gov.",     color: "text-teal-700",   bg: "bg-teal-50 border-teal-200" },
  BEHAVIORAL:   { label: "Behavioural",       color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
};

const EXP_BADGE: Record<string, { label: string; color: string }> = {
  "0-1": { label: "0–1 Years", color: "bg-slate-100 text-slate-700 border-slate-300" },
  "1-3": { label: "1–3 Years", color: "bg-sky-100 text-sky-800 border-sky-300" },
  "3-5": { label: "3–5 Years", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  "5+":  { label: "5+ Years",  color: "bg-purple-100 text-purple-800 border-purple-300" },
};

export function ProfileView({ officer, competencies, onSelectOfficer }: ProfileViewProps) {
  const met = competencies.filter((c) => c.current >= c.target).length;
  const overallPercent = Math.round((met / (competencies.length || 1)) * 100);
  const avgCurrent = competencies.length
    ? (competencies.reduce((s, c) => s + c.current, 0) / competencies.length).toFixed(1)
    : "0";
  const totalGap = competencies.reduce((s, c) => s + Math.max(c.target - c.current, 0), 0);

  // Group competencies by category
  const categorized: Record<string, CompetencyItem[]> = {};
  competencies.forEach((c) => {
    const cat = c.category || "FUNCTIONAL";
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(c);
  });

  const expBadge = EXP_BADGE[officer.experienceLevel] ?? EXP_BADGE["1-3"];

  return (
    <div className="profile-view">
      <div className="profile-header">
        <h2>Employee Profile</h2>
        <p>Full FRAC-aligned professional profile for {officer.name} — {officer.cadreRank}</p>
      </div>

      {/* Top identity strip */}
      <div className="profile-identity-card">
        <div className="profile-identity-left">
          <div className="profile-avatar-xl">{officer.avatar}</div>
          <div>
            <h3 className="profile-name">{officer.name}</h3>
            <p className="profile-desig">{officer.designation}</p>
            <p className="profile-org">{officer.department}</p>
            <div className="profile-tags">
              <span className={`profile-exp-badge ${expBadge.color}`}>{expBadge.label} Experience</span>
              <span className="profile-rank-badge">{officer.cadreRank}</span>
            </div>
          </div>
        </div>

        {/* KPI summary strip */}
        <div className="profile-kpi-strip">
          <div className="profile-kpi">
            <span className="profile-kpi-num" style={{ color: overallPercent >= 70 ? "#16a34a" : overallPercent >= 40 ? "#d97706" : "#dc2626" }}>{overallPercent}%</span>
            <span className="profile-kpi-label">FRAC Compliance</span>
          </div>
          <div className="profile-kpi">
            <span className="profile-kpi-num">{avgCurrent}</span>
            <span className="profile-kpi-label">Avg. Level (of 5)</span>
          </div>
          <div className="profile-kpi">
            <span className="profile-kpi-num">{met}/{competencies.length}</span>
            <span className="profile-kpi-label">Targets Met</span>
          </div>
          <div className="profile-kpi">
            <span className="profile-kpi-num" style={{ color: totalGap > 10 ? "#dc2626" : totalGap > 5 ? "#d97706" : "#16a34a" }}>{totalGap}</span>
            <span className="profile-kpi-label">Total Gap Points</span>
          </div>
        </div>
      </div>

      {/* Two-column details grid */}
      <div className="profile-details-grid">
        {/* Left: Service & Personal */}
        <div className="profile-section-card">
          <h4 className="profile-section-title">
            <Briefcase className="h-4 w-4" /> Service & Assignment
          </h4>
          <dl className="profile-dl">
            <div className="profile-dl-row">
              <dt>Employee ID</dt><dd className="font-mono">{officer.id}</dd>
            </div>
            <div className="profile-dl-row">
              <dt>Job Role</dt><dd>{officer.jobRole}</dd>
            </div>
            <div className="profile-dl-row">
              <dt>Division</dt><dd>{officer.division}</dd>
            </div>
            <div className="profile-dl-row">
              <dt>iGOT User ID</dt><dd className="font-mono text-primary">{officer.igotUserId}</dd>
            </div>
            <div className="profile-dl-row">
              <dt>Email</dt><dd>{officer.email}</dd>
            </div>
            <div className="profile-dl-row">
              <dt><MapPin className="inline h-3 w-3 mr-0.5" />Location</dt><dd>{officer.region}</dd>
            </div>
            <div className="profile-dl-row">
              <dt><CalendarDays className="inline h-3 w-3 mr-0.5" />Joined</dt><dd>{officer.joinDate}</dd>
            </div>
            <div className="profile-dl-row">
              <dt>Experience</dt>
              <dd>
                <span className={`profile-exp-badge ${expBadge.color}`}>{expBadge.label}</span>
                &nbsp;({officer.experienceYears} yr{officer.experienceYears !== 1 ? "s" : ""})
              </dd>
            </div>
          </dl>

          <div className="profile-assignment-box">
            <p className="profile-assignment-label">Current Assignment</p>
            <p className="profile-assignment-value">{officer.currentAssignment}</p>
          </div>
        </div>

        {/* Right: Education */}
        <div className="profile-section-card">
          <h4 className="profile-section-title">
            <GraduationCap className="h-4 w-4" /> Education & Qualifications
          </h4>
          <div className="profile-edu-box">
            <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="profile-edu-degree">{officer.educationQualification}</p>
              <p className="profile-edu-sub">Academic Qualification on Record</p>
            </div>
          </div>

          <h4 className="profile-section-title mt-5">
            <BookOpen className="h-4 w-4" /> Previous Training History
          </h4>
          {officer.previousTraining.length === 0 ? (
            <p className="text-xs text-fg-muted">No training history recorded.</p>
          ) : (
            <div className="profile-training-list">
              {officer.previousTraining.map((t, i) => (
                <div key={i} className="profile-training-item">
                  <div className="profile-training-left">
                    <Star className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="profile-training-title">{t.courseTitle}</p>
                      <p className="profile-training-meta">{t.provider} · {t.completedDate}</p>
                    </div>
                  </div>
                  <div className="profile-training-right">
                    <span className="profile-training-code">{t.competencyCode}</span>
                    <span className="profile-training-level">Level {t.levelAchieved}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Competency Overview — grouped by category */}
      <div className="profile-section-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="profile-section-title mb-0">
            <TrendingUp className="h-4 w-4" /> FRAC Competency Profile — {competencies.length} Competencies
          </h4>
          <div className="flex items-center gap-2">
            {Object.entries(CATEGORY_META).filter(([k]) => categorized[k]).map(([k, m]) => (
              <span key={k} className={`profile-cat-legend ${m.bg} ${m.color}`}>{m.label}</span>
            ))}
          </div>
        </div>

        {Object.entries(categorized).map(([cat, items]) => {
          const meta = CATEGORY_META[cat] ?? CATEGORY_META.FUNCTIONAL;
          return (
            <div key={cat} className="profile-cat-group">
              <p className={`profile-cat-label ${meta.color}`}>{meta.label}</p>
              <div className="profile-competency-list">
                {items.map((c) => {
                  const pct = Math.round((c.current / PROFICIENCY_MAX) * 100);
                  const gap = c.target - c.current;
                  const isGood = gap <= 0;
                  return (
                    <div key={c.fracCode} className="profile-competency-row">
                      <div className="profile-comp-info">
                        <span className="profile-comp-name">{c.label}</span>
                        <span className="profile-comp-code">{c.fracCode}</span>
                      </div>
                      <div className="profile-comp-bar-wrapper">
                        <div className="profile-comp-bar">
                          <div
                            className="profile-comp-fill"
                            style={{ width: `${pct}%`, backgroundColor: isGood ? "#16a34a" : gap >= 2 ? "#ef4444" : "#f59e0b" }}
                          />
                          {/* Target marker */}
                          <div
                            className="profile-comp-target-marker"
                            style={{ left: `${(c.target / PROFICIENCY_MAX) * 100}%` }}
                          />
                        </div>
                        <span className="profile-comp-score">
                          {c.current}/{c.target}
                          {isGood && <span className="ml-1 text-emerald-600">✓</span>}
                          {!isGood && gap >= 2 && <span className="ml-1 text-red-500">-{gap}</span>}
                          {!isGood && gap === 1 && <span className="ml-1 text-amber-500">-1</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="profile-comp-legend-note">
          Bar fill = current level · Marker (|) = required target for {officer.designation} at {officer.experienceLevel} years experience
        </p>
      </div>

      {/* Officer Switcher */}
      <div className="profile-switcher">
        <h3><Users className="inline h-4 w-4 mr-1" />Switch Demo Profile</h3>
        <div className="profile-switcher-list">
          {DEMO_OFFICERS.map((o) => (
            <button
              key={o.id}
              className={`profile-switcher-btn ${officer.id === o.id ? "is-active" : ""}`}
              onClick={() => onSelectOfficer(o)}
            >
              <span className="profile-switcher-avatar">{o.avatar}</span>
              <div>
                <strong>{o.name}</strong>
                <small>{o.designation} · {o.cadreRank} · {o.experienceLevel} yrs</small>
              </div>
              {officer.id === o.id && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
