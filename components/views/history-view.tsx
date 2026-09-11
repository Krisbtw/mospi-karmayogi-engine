"use client";

import { CompetencyItem, IgotCourse } from "@/lib/data-service";

interface HistoryViewProps {
  competencies: CompetencyItem[];
  recommendations: IgotCourse[];
  officerName: string;
  cadreRank: string;
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

export function HistoryView({ competencies, recommendations, officerName, cadreRank }: HistoryViewProps) {
  // Build history from existing data
  const entries: HistoryEntry[] = [];

  // Add assessment history from competencies
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

  // Add completed courses
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

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Competency History</h2>
        <p>
          {officerName} · {cadreRank} · Track of all assessments, courses, and competency changes.
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
          <span className="history-stat-num">{entries.length}</span>
          <span className="history-stat-label">Total Events</span>
        </div>
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
  );
}
