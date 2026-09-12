"use client";

import { CompetencyItem, IgotCourse } from "@/lib/data-service";
import { TRAINING_EFFECTIVENESS_DATA, COHORT_EFFECTIVENESS_SUMMARY } from "@/lib/training-effectiveness";
import { TrendingUp, TrendingDown, Minus, BookOpen, ClipboardList, Sparkles } from "lucide-react";

interface HistoryViewProps {
  competencies: CompetencyItem[];
  recommendations: IgotCourse[];
  officerName: string;
  cadreRank: string;
  officerId?: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  type: "assessment" | "course" | "quiz";
  title: string;
  competency: string;
  detail: string;
  impact: string;
}

export function HistoryView({ competencies, recommendations, officerName, cadreRank, officerId }: HistoryViewProps) {
  // Build history from existing data
  const entries: HistoryEntry[] = [];

  competencies.forEach((c) => {
    entries.push({
      id: `assess-${c.fracCode}`,
      date: c.lastAssessed,
      type: "assessment",
      title: `Diagnostic Assessment: ${c.label}`,
      competency: c.label,
      detail: `Assessed at Level ${c.current}/5 against ${cadreRank} target of ${c.target}/5`,
      impact:
        c.current >= c.target
          ? "Competency target met"
          : `Gap of ${c.target - c.current} level${c.target - c.current > 1 ? "s" : ""} identified`,
    });
  });

  recommendations
    .filter((r) => r.status === "COMPLETED")
    .forEach((r) => {
      entries.push({
        id: `course-${r.id}`,
        date: "Recently",
        type: "course",
        title: `Completed: ${r.courseTitle}`,
        competency: r.competencyLabel,
        detail: `${r.durationHours}h · ${r.provider}`,
        impact: `+1 level in ${r.competencyLabel}`,
      });
    });

  const typeIcons: Record<string, string> = {
    assessment: "📋",
    course: "📚",
    quiz: "✍️",
  };

  const typeLabels: Record<string, string> = {
    assessment: "Assessment",
    course: "Course Completion",
    quiz: "AI Quiz",
  };

  // Training effectiveness records for this officer
  const effectivenessRecords = TRAINING_EFFECTIVENESS_DATA.filter(
    (r) => r.officerId === officerId
  );

  const totalImprovement = effectivenessRecords.reduce((s, r) => s + r.improvement, 0);
  const avgGain = effectivenessRecords.length > 0
    ? (totalImprovement / effectivenessRecords.length).toFixed(1)
    : "0";

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Competency History & Training Effectiveness</h2>
        <p>
          {officerName} · {cadreRank} · Track of all assessments, courses, and competency before/after comparisons.
        </p>
      </div>

      <div className="history-stats-bar">
        <div className="history-stat">
          <span className="history-stat-num">{competencies.length}</span>
          <span className="history-stat-label">Competencies Tracked</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-num">
            {recommendations.filter((r) => r.status === "COMPLETED").length}
          </span>
          <span className="history-stat-label">Courses Completed</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-num">
            {competencies.filter((c) => c.current >= c.target).length}
          </span>
          <span className="history-stat-label">Targets Met</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-num">{effectivenessRecords.length}</span>
          <span className="history-stat-label">Trainings Tracked</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-num" style={{ color: "#16a34a" }}>+{avgGain}</span>
          <span className="history-stat-label">Avg Level Gain</span>
        </div>
      </div>

      {/* ── Training Effectiveness: Before / After ───────────────────── */}
      {effectivenessRecords.length > 0 && (
        <div className="effectiveness-panel">
          <div className="effectiveness-header">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3>Training Effectiveness — Before vs. After</h3>
            <span className="effectiveness-cohort-tag">
              {effectivenessRecords[0]?.cohort}
            </span>
          </div>
          <p className="effectiveness-sub">
            Validated proficiency levels captured before enrollment and after assessment completion.
          </p>

          <div className="effectiveness-table-wrapper">
            <table className="effectiveness-table">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Category</th>
                  <th>Training / Course</th>
                  <th>Provider</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Change</th>
                  <th>Assessed</th>
                </tr>
              </thead>
              <tbody>
                {effectivenessRecords.map((r, i) => {
                  const delta = r.improvement;
                  return (
                    <tr key={i}>
                      <td className="font-medium text-fg">{r.competencyLabel}</td>
                      <td>
                        <span className={`eff-cat-pill ${
                          r.category === "Statistical" ? "eff-cat-stat" :
                          r.category === "Technical" ? "eff-cat-tech" :
                          r.category === "Digital Governance" ? "eff-cat-dg" :
                          "eff-cat-beh"
                        }`}>{r.category}</span>
                      </td>
                      <td className="text-fg-muted">{r.trainingCourse}</td>
                      <td className="text-fg-muted font-mono text-[11px]">{r.provider}</td>
                      <td>
                        <div className="eff-level-pill eff-before">{r.beforeLevel}/5</div>
                      </td>
                      <td>
                        <div className="eff-level-pill eff-after">{r.afterLevel}/5</div>
                      </td>
                      <td>
                        {delta > 0 ? (
                          <span className="eff-delta-pos">
                            <TrendingUp className="h-3.5 w-3.5" /> +{delta}
                          </span>
                        ) : delta < 0 ? (
                          <span className="eff-delta-neg">
                            <TrendingDown className="h-3.5 w-3.5" /> {delta}
                          </span>
                        ) : (
                          <span className="eff-delta-neutral">
                            <Minus className="h-3.5 w-3.5" /> 0
                          </span>
                        )}
                      </td>
                      <td className="text-fg-muted text-[11px]">{r.assessedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      <div className="history-timeline-section">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-4 w-4 text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg">Assessment & Course Event Log</h3>
        </div>

        <div className="history-timeline">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="history-entry">
                <div className="history-entry-icon">{typeIcons[entry.type]}</div>
                <div className="history-entry-content">
                  <div className="history-entry-top">
                    <span className={`history-type-badge history-type-${entry.type}`}>
                      {typeLabels[entry.type]}
                    </span>
                    <span className="history-date">{entry.date}</span>
                  </div>
                  <h4>{entry.title}</h4>
                  <p className="history-detail">{entry.detail}</p>
                  <p className="history-impact">{entry.impact}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="history-empty">No competency history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
