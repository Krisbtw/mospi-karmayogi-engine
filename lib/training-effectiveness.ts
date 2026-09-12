// Training Effectiveness Tracking
// Before / After proficiency measurements per officer per competency

export interface TrainingEffectivenessRecord {
  officerId: string;
  competencyCode: string;
  competencyLabel: string;
  category: string;
  beforeLevel: number;
  afterLevel: number;
  improvement: number;
  trainingCourse: string;
  provider: string;
  assessedDate: string;
  cohort: string;
}

export const TRAINING_EFFECTIVENESS_DATA: TrainingEffectivenessRecord[] = [
  // Anjali Sharma (JSO) — Q2 FY2026 NSSTA Cohort
  { officerId: "user_jso_pune", competencyCode: "FN-STAT-014", competencyLabel: "Survey Sampling Design",        category: "Statistical",        beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "NSSO Field Enumeration Basics",          provider: "NSSTA",          assessedDate: "Mar 2025", cohort: "Q2 FY2026 NSSTA Batch" },
  { officerId: "user_jso_pune", competencyCode: "FN-STAT-033", competencyLabel: "R/Python for Survey Processing", category: "Technical",          beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "Data Entry & Validation Protocols",       provider: "FOD Training Cell", assessedDate: "May 2025", cohort: "Q2 FY2026 NSSTA Batch" },
  { officerId: "user_jso_pune", competencyCode: "BH-INTEGRITY-001", competencyLabel: "Data Integrity & Ethics",  category: "Behavioural",        beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "Statistical Ethics & Confidentiality",    provider: "NSSTA",          assessedDate: "Jul 2025", cohort: "Q2 FY2026 NSSTA Batch" },
  { officerId: "user_jso_pune", competencyCode: "DM-PRICE-002", competencyLabel: "Price Statistics (CPI/WPI)",   category: "Statistical",        beforeLevel: 1, afterLevel: 2, improvement: 1, trainingCourse: "CPI Compilation Fundamentals",            provider: "NSSTA",          assessedDate: "Jul 2025", cohort: "Q2 FY2026 NSSTA Batch" },
  { officerId: "user_jso_pune", competencyCode: "TC-DATAVIZ-001", competencyLabel: "Data Visualization",         category: "Technical",          beforeLevel: 1, afterLevel: 2, improvement: 1, trainingCourse: "Intro to Data Visualization",             provider: "NSSTA LMS",      assessedDate: "Aug 2025", cohort: "Q2 FY2026 NSSTA Batch" },
  { officerId: "user_jso_pune", competencyCode: "DG-EGOV-001", competencyLabel: "e-Governance Platforms",        category: "Digital Governance", beforeLevel: 1, afterLevel: 2, improvement: 1, trainingCourse: "e-Governance & Digital India Platforms",   provider: "DeitY",          assessedDate: "Sep 2025", cohort: "Q2 FY2026 NSSTA Batch" },

  // Rohit Verma (SO) — Q3 FY2025 NAD Cohort
  { officerId: "user_so_delhi", competencyCode: "FN-STAT-014", competencyLabel: "Survey Sampling Design",         category: "Statistical",        beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "NSSO Multistage Sampling",                provider: "SDRD",           assessedDate: "Oct 2023", cohort: "Q3 FY2025 NAD Cohort" },
  { officerId: "user_so_delhi", competencyCode: "FN-STAT-021", competencyLabel: "National Income Accounting",     category: "Statistical",        beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "SNA 2008 GVA Compilation",                 provider: "NSSTA",          assessedDate: "Apr 2024", cohort: "Q3 FY2025 NAD Cohort" },
  { officerId: "user_so_delhi", competencyCode: "FN-STAT-033", competencyLabel: "R/Python for Survey Processing", category: "Technical",          beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "R for Official Statistical Data",          provider: "DQAD",           assessedDate: "Jan 2025", cohort: "Q3 FY2025 NAD Cohort" },
  { officerId: "user_so_delhi", competencyCode: "DM-PRICE-002", competencyLabel: "Price Statistics (CPI/WPI)",    category: "Statistical",        beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "CPI Advanced Methods",                     provider: "NSSTA",          assessedDate: "Jul 2025", cohort: "Q3 FY2025 NAD Cohort" },
  { officerId: "user_so_delhi", competencyCode: "TC-DATAVIZ-001", competencyLabel: "Data Visualization",          category: "Technical",          beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "Data Visualization Workshop",               provider: "NSSTA",          assessedDate: "Sep 2025", cohort: "Q3 FY2025 NAD Cohort" },
  { officerId: "user_so_delhi", competencyCode: "BH-LEAD-001", competencyLabel: "Leadership & Team Coordination", category: "Behavioural",        beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "Mid-Career Leadership Programme",          provider: "LBSNAA",         assessedDate: "Aug 2025", cohort: "Q3 FY2025 NAD Cohort" },

  // Dr. Sunita Iyer (DD) — Multi-year ESD Training Programme
  { officerId: "user_dd_kolkata", competencyCode: "FN-STAT-014", competencyLabel: "Survey Sampling Design",         category: "Statistical",        beforeLevel: 3, afterLevel: 5, improvement: 2, trainingCourse: "NSSO Advanced Sampling Theory",              provider: "ISI Kolkata",    assessedDate: "May 2018", cohort: "ESD Leadership Programme FY2019" },
  { officerId: "user_dd_kolkata", competencyCode: "FN-STAT-021", competencyLabel: "National Income Accounting",     category: "Statistical",        beforeLevel: 3, afterLevel: 5, improvement: 2, trainingCourse: "SNA 2008 Full Implementation",                provider: "NSSTA",          assessedDate: "Sep 2019", cohort: "ESD Leadership Programme FY2019" },
  { officerId: "user_dd_kolkata", competencyCode: "FN-STAT-033", competencyLabel: "R/Python for Survey Processing", category: "Technical",          beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "Python for Microdata Analysis",               provider: "DQAD",           assessedDate: "Mar 2022", cohort: "ESD Leadership Programme FY2019" },
  { officerId: "user_dd_kolkata", competencyCode: "BH-LEAD-001", competencyLabel: "Leadership & Team Coordination", category: "Behavioural",        beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "Statistical Leadership Programme",           provider: "LBSNAA",         assessedDate: "Jan 2024", cohort: "ESD Leadership Programme FY2019" },
  { officerId: "user_dd_kolkata", competencyCode: "TC-GIS-001",  competencyLabel: "GIS & Geospatial Analysis",      category: "Technical",          beforeLevel: 1, afterLevel: 3, improvement: 2, trainingCourse: "GIS for Statistical Operations",             provider: "NSSTA",          assessedDate: "Jun 2024", cohort: "ESD Leadership Programme FY2019" },
  { officerId: "user_dd_kolkata", competencyCode: "DG-EGOV-001", competencyLabel: "e-Governance Platforms",         category: "Digital Governance", beforeLevel: 2, afterLevel: 4, improvement: 2, trainingCourse: "e-Governance Digital India",                  provider: "DeitY",          assessedDate: "Nov 2025", cohort: "ESD Leadership Programme FY2019" },
];

// Cadre-wide training effectiveness summary (for admin dashboard)
export const COHORT_EFFECTIVENESS_SUMMARY = [
  { cohort: "Q1 FY2027 — National Cohort (All Divisions)", participants: 312, completionRate: 88, avgBefore: 2.1, avgAfter: 3.4, improvement: 1.3, topGainer: "R/Python for Survey Processing" },
  { cohort: "Q4 FY2026 — FOD Field Officers",              participants: 418, completionRate: 91, avgBefore: 1.9, avgAfter: 3.1, improvement: 1.2, topGainer: "Survey Sampling Design" },
  { cohort: "Q3 FY2026 — NAD Analysts",                    participants: 176, completionRate: 85, avgBefore: 2.4, avgAfter: 3.5, improvement: 1.1, topGainer: "National Income Accounting" },
  { cohort: "Q2 FY2026 — ESD Data Processing",             participants: 213, completionRate: 79, avgBefore: 2.0, avgAfter: 3.2, improvement: 1.2, topGainer: "Data Visualization & Dashboarding" },
];

// Skill-wise improvement across cadre
export const COMPETENCY_EFFECTIVENESS_AGGREGATE = [
  { competencyLabel: "R/Python for Survey Processing", fracCode: "FN-STAT-033", avgBeforeLevel: 1.8, avgAfterLevel: 3.2, gain: 1.4, officersTrained: 241, category: "Technical" },
  { competencyLabel: "Data Visualization & Dashboarding", fracCode: "TC-DATAVIZ-001", avgBeforeLevel: 1.6, avgAfterLevel: 2.9, gain: 1.3, officersTrained: 198, category: "Technical" },
  { competencyLabel: "Survey Sampling Design", fracCode: "FN-STAT-014", avgBeforeLevel: 2.1, avgAfterLevel: 3.4, gain: 1.3, officersTrained: 312, category: "Statistical" },
  { competencyLabel: "Price Statistics (CPI/WPI)", fracCode: "DM-PRICE-002", avgBeforeLevel: 2.4, avgAfterLevel: 3.1, gain: 0.7, officersTrained: 178, category: "Statistical" },
  { competencyLabel: "National Income Accounting", fracCode: "FN-STAT-021", avgBeforeLevel: 2.2, avgAfterLevel: 3.1, gain: 0.9, officersTrained: 156, category: "Statistical" },
  { competencyLabel: "Data Integrity & Ethics", fracCode: "BH-INTEGRITY-001", avgBeforeLevel: 3.9, avgAfterLevel: 4.2, gain: 0.3, officersTrained: 418, category: "Behavioural" },
  { competencyLabel: "e-Governance & Digital India", fracCode: "DG-EGOV-001", avgBeforeLevel: 1.5, avgAfterLevel: 2.6, gain: 1.1, officersTrained: 290, category: "Digital Governance" },
  { competencyLabel: "Leadership & Team Coordination", fracCode: "BH-LEAD-001", avgBeforeLevel: 2.0, avgAfterLevel: 3.0, gain: 1.0, officersTrained: 134, category: "Behavioural" },
];
