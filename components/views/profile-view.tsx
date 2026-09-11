"use client";

import { Officer, CompetencyItem, DEMO_OFFICERS } from "@/lib/data-service";

interface ProfileViewProps {
  officer: Officer;
  competencies: CompetencyItem[];
  onSelectOfficer: (officer: Officer) => void;
}

const PROFICIENCY_MAX = 5;

export function ProfileView({ officer, competencies, onSelectOfficer }: ProfileViewProps) {
  const met = competencies.filter((c) => c.current >= c.target).length;
  const overallPercent = Math.round((met / (competencies.length || 1)) * 100);
  const avgCurrent = competencies.length
    ? (competencies.reduce((s, c) => s + c.current, 0) / competencies.length).toFixed(1)
    : "0";

  return (
    <div className="profile-view">
      <div className="profile-header">
        <h2>Employee Profile</h2>
        <p>View and manage officer profile information and competency overview.</p>
      </div>

      <div className="profile-content-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">{officer.avatar}</div>
          <h3>{officer.name}</h3>
          <p className="profile-designation">{officer.designation}</p>

          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Employee ID</span>
              <span className="profile-detail-value">{officer.id}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Department</span>
              <span className="profile-detail-value">Ministry of Statistics & Programme Implementation</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Designation</span>
              <span className="profile-detail-value">{officer.designation}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Division</span>
              <span className="profile-detail-value">{officer.division}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Cadre Rank</span>
              <span className="profile-detail-value">{officer.cadreRank}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Location</span>
              <span className="profile-detail-value">{officer.region}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">iGOT User ID</span>
              <span className="profile-detail-value">{officer.igotUserId}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Email</span>
              <span className="profile-detail-value">{officer.email}</span>
            </div>
          </div>
        </div>

        {/* Competency Overview */}
        <div className="profile-competency-card">
          <h3>Competency Overview</h3>
          <div className="profile-competency-summary">
            <div className="profile-summary-stat">
              <span className="profile-summary-num">{overallPercent}%</span>
              <span className="profile-summary-label">FRAC Compliance</span>
            </div>
            <div className="profile-summary-stat">
              <span className="profile-summary-num">{avgCurrent}</span>
              <span className="profile-summary-label">Avg. Level</span>
            </div>
            <div className="profile-summary-stat">
              <span className="profile-summary-num">{met}/{competencies.length}</span>
              <span className="profile-summary-label">Targets Met</span>
            </div>
          </div>

          <div className="profile-competency-list">
            {competencies.map((c) => (
              <div key={c.fracCode} className="profile-competency-row">
                <div className="profile-comp-info">
                  <span className="profile-comp-name">{c.label}</span>
                  <span className="profile-comp-code">{c.fracCode}</span>
                </div>
                <div className="profile-comp-bar-wrapper">
                  <div className="profile-comp-bar">
                    <div
                      className="profile-comp-fill"
                      style={{ width: `${(c.current / PROFICIENCY_MAX) * 100}%` }}
                    />
                  </div>
                  <span className="profile-comp-score">
                    {c.current}/{c.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Officer Switcher */}
      <div className="profile-switcher">
        <h3>Switch Demo Profile</h3>
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
                <small>{o.designation} · {o.cadreRank}</small>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
