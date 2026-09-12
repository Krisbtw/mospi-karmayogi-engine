export interface PreviousTraining {
  courseTitle: string;
  provider: string;
  completedDate: string;
  competencyCode: string;
  levelAchieved: number;
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  designation: string;
  cadreRank: "JSO" | "SO" | "DD";
  region: string;
  division: string;
  igotUserId: string;
  avatar: string;
  // SIH-required extended profile fields
  department: string;
  jobRole: string;
  currentAssignment: string;
  educationQualification: string;
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+";
  experienceYears: number;
  previousTraining: PreviousTraining[];
  joinDate: string;
}

export interface CompetencyItem {
  id: string;
  fracCode: string;
  label: string;
  category: "DOMAIN" | "FUNCTIONAL" | "BEHAVIORAL" | "TECHNICAL" | "DIGITAL_GOV";
  description: string;
  current: number; // 1-5
  target: number;  // 1-5
  lastAssessed: string;
}

export interface IgotCourse {
  id: string;
  igotCourseId: string;
  courseTitle: string;
  courseUrl: string;
  competencyFracCode: string;
  competencyLabel: string;
  matchScore: number;
  durationHours: number;
  provider: string;
  status: "RECOMMENDED" | "ENROLLED" | "IN_PROGRESS" | "COMPLETED";
}

export interface DocumentItem {
  id: string;
  title: string;
  sourceType: "PLFS_HANDBOOK" | "CPI_METHODOLOGY" | "NATIONAL_ACCOUNTS_MANUAL" | "ASI_METHODOLOGY";
  pageCount: number;
  fileSizeKb: number;
  chunkCount: number;
  uploadedAt: string;
  status: "READY" | "PROCESSING" | "FAILED";
  summary: string;
}

export interface QuestionChoice {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  stem: string;
  choices: QuestionChoice[];
  correctChoice: "A" | "B" | "C" | "D";
  rationale: string;
  bloomLevel: "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
  difficulty: number;
  competencyFracCode: string;
  competencyLabel: string;
  sourceDocument: string;
  sourceCitation: string;
  sourceSnippet: string;
}

// ──────────────────────────────────────────────
// Role-Based Competency Framework  (Job Role → Experience Level → FRAC Target)
// ──────────────────────────────────────────────
export const ROLE_COMPETENCY_FRAMEWORK: Record<string, {
  competencies: string[];
  targetLevels: Record<string, Record<string, number>>;
}> = {
  "Junior Statistical Officer": {
    competencies: ["FN-STAT-014","DM-PRICE-002","FN-STAT-021","FN-STAT-033","BH-INTEGRITY-001","FN-STAT-042","TC-DATAVIZ-001","TC-SQL-001","DG-EGOV-001","TC-GIS-001","BH-COMM-001","BH-LEAD-001"],
    targetLevels: {
      "0-1": { "FN-STAT-014":2, "DM-PRICE-002":2, "FN-STAT-021":2, "FN-STAT-033":2, "BH-INTEGRITY-001":3, "FN-STAT-042":2, "TC-DATAVIZ-001":2, "TC-SQL-001":2, "DG-EGOV-001":2, "TC-GIS-001":1, "BH-COMM-001":2, "BH-LEAD-001":1 },
      "1-3": { "FN-STAT-014":3, "DM-PRICE-002":3, "FN-STAT-021":3, "FN-STAT-033":3, "BH-INTEGRITY-001":4, "FN-STAT-042":3, "TC-DATAVIZ-001":3, "TC-SQL-001":3, "DG-EGOV-001":3, "TC-GIS-001":2, "BH-COMM-001":3, "BH-LEAD-001":2 },
      "3-5": { "FN-STAT-014":4, "DM-PRICE-002":4, "FN-STAT-021":4, "FN-STAT-033":4, "BH-INTEGRITY-001":5, "FN-STAT-042":4, "TC-DATAVIZ-001":4, "TC-SQL-001":4, "DG-EGOV-001":3, "TC-GIS-001":3, "BH-COMM-001":4, "BH-LEAD-001":3 },
      "5+":  { "FN-STAT-014":5, "DM-PRICE-002":5, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":4, "TC-GIS-001":4, "BH-COMM-001":5, "BH-LEAD-001":4 },
    },
  },
  "Senior Statistical Officer": {
    competencies: ["FN-STAT-014","DM-PRICE-002","FN-STAT-021","FN-STAT-033","BH-INTEGRITY-001","FN-STAT-042","TC-DATAVIZ-001","TC-SQL-001","DG-EGOV-001","TC-GIS-001","BH-COMM-001","BH-LEAD-001"],
    targetLevels: {
      "0-1": { "FN-STAT-014":3, "DM-PRICE-002":3, "FN-STAT-021":3, "FN-STAT-033":3, "BH-INTEGRITY-001":4, "FN-STAT-042":3, "TC-DATAVIZ-001":3, "TC-SQL-001":3, "DG-EGOV-001":3, "TC-GIS-001":2, "BH-COMM-001":3, "BH-LEAD-001":3 },
      "1-3": { "FN-STAT-014":4, "DM-PRICE-002":4, "FN-STAT-021":4, "FN-STAT-033":4, "BH-INTEGRITY-001":5, "FN-STAT-042":4, "TC-DATAVIZ-001":4, "TC-SQL-001":4, "DG-EGOV-001":4, "TC-GIS-001":3, "BH-COMM-001":4, "BH-LEAD-001":3 },
      "3-5": { "FN-STAT-014":5, "DM-PRICE-002":4, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":4, "TC-GIS-001":4, "BH-COMM-001":5, "BH-LEAD-001":4 },
      "5+":  { "FN-STAT-014":5, "DM-PRICE-002":5, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":5, "TC-GIS-001":5, "BH-COMM-001":5, "BH-LEAD-001":5 },
    },
  },
  "Deputy Director": {
    competencies: ["FN-STAT-014","DM-PRICE-002","FN-STAT-021","FN-STAT-033","BH-INTEGRITY-001","FN-STAT-042","TC-DATAVIZ-001","TC-SQL-001","DG-EGOV-001","TC-GIS-001","BH-COMM-001","BH-LEAD-001"],
    targetLevels: {
      "0-1": { "FN-STAT-014":4, "DM-PRICE-002":4, "FN-STAT-021":4, "FN-STAT-033":4, "BH-INTEGRITY-001":5, "FN-STAT-042":4, "TC-DATAVIZ-001":4, "TC-SQL-001":4, "DG-EGOV-001":4, "TC-GIS-001":3, "BH-COMM-001":4, "BH-LEAD-001":4 },
      "1-3": { "FN-STAT-014":5, "DM-PRICE-002":5, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":5, "TC-GIS-001":4, "BH-COMM-001":5, "BH-LEAD-001":5 },
      "3-5": { "FN-STAT-014":5, "DM-PRICE-002":5, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":5, "TC-GIS-001":5, "BH-COMM-001":5, "BH-LEAD-001":5 },
      "5+":  { "FN-STAT-014":5, "DM-PRICE-002":5, "FN-STAT-021":5, "FN-STAT-033":5, "BH-INTEGRITY-001":5, "FN-STAT-042":5, "TC-DATAVIZ-001":5, "TC-SQL-001":5, "DG-EGOV-001":5, "TC-GIS-001":5, "BH-COMM-001":5, "BH-LEAD-001":5 },
    },
  },
};

// NSSTA TPAC (Training Programme Advisory Committee) Programs
export interface TpacProgram {
  id: string;
  title: string;
  duration: string;
  targetRoles: string[];
  competencies: string[];
  location: string;
  nextBatch: string;
  mode: "IN_PERSON" | "ONLINE" | "HYBRID";
}

export const NSSTA_TPAC_PROGRAMS: TpacProgram[] = [
  { id: "tpac_001", title: "Statistical Methods for Survey Design & Sampling", duration: "5 Days", targetRoles: ["JSO", "SO"], competencies: ["FN-STAT-014"], location: "NSSTA Greater Noida", nextBatch: "Oct 2026", mode: "IN_PERSON" },
  { id: "tpac_002", title: "Advanced CPI/WPI Compilation & Quality Assurance", duration: "3 Days", targetRoles: ["SO", "DD"], competencies: ["DM-PRICE-002"], location: "CSO Headquarters New Delhi", nextBatch: "Nov 2026", mode: "HYBRID" },
  { id: "tpac_003", title: "R & Python for Official Statistical Data Processing", duration: "10 Days", targetRoles: ["JSO", "SO"], competencies: ["FN-STAT-033", "TC-SQL-001"], location: "NSSTA Greater Noida", nextBatch: "Oct 2026", mode: "IN_PERSON" },
  { id: "tpac_004", title: "National Accounts: SNA 2008 Implementation & GVA", duration: "5 Days", targetRoles: ["SO", "DD"], competencies: ["FN-STAT-021"], location: "NAD Conference Hall, New Delhi", nextBatch: "Dec 2026", mode: "IN_PERSON" },
  { id: "tpac_005", title: "Data Visualization & Dashboard Design for MoSPI", duration: "3 Days", targetRoles: ["JSO", "SO", "DD"], competencies: ["TC-DATAVIZ-001"], location: "Online (NSSTA LMS)", nextBatch: "Sep 2026", mode: "ONLINE" },
  { id: "tpac_006", title: "GIS & Geospatial Analysis for Statistical Operations", duration: "5 Days", targetRoles: ["JSO", "SO"], competencies: ["TC-GIS-001"], location: "NSSTA Greater Noida", nextBatch: "Jan 2027", mode: "IN_PERSON" },
  { id: "tpac_007", title: "e-Governance & Digital India Platforms for Officers", duration: "2 Days", targetRoles: ["JSO", "SO", "DD"], competencies: ["DG-EGOV-001"], location: "Online (NSSTA LMS)", nextBatch: "Oct 2026", mode: "ONLINE" },
  { id: "tpac_008", title: "Statistical Leadership & Institutional Communication", duration: "3 Days", targetRoles: ["SO", "DD"], competencies: ["BH-LEAD-001", "BH-COMM-001"], location: "LBSNAA Mussoorie", nextBatch: "Nov 2026", mode: "IN_PERSON" },
];

// Pre-seeded Demo Officers
export const DEMO_OFFICERS: Officer[] = [
  {
    id: "user_jso_pune",
    name: "Anjali Sharma",
    email: "a.sharma@mospi.gov.in",
    designation: "Junior Statistical Officer",
    cadreRank: "JSO",
    region: "Maharashtra (West Zone)",
    division: "FOD (Field Operations Division)",
    igotUserId: "igot_usr_99812",
    avatar: "AS",
    department: "Ministry of Statistics & Programme Implementation",
    jobRole: "Field Enumerator & Data Processor",
    currentAssignment: "PLFS Round 15 — Maharashtra (West Zone)",
    educationQualification: "M.Sc. Statistics, Savitribai Phule Pune University",
    experienceLevel: "1-3",
    experienceYears: 2,
    previousTraining: [
      { courseTitle: "NSSO Field Enumeration Basics", provider: "NSSTA", completedDate: "Jan 2025", competencyCode: "FN-STAT-014", levelAchieved: 2 },
      { courseTitle: "Data Entry & Validation Protocols", provider: "FOD Training Cell", completedDate: "Mar 2025", competencyCode: "FN-STAT-033", levelAchieved: 3 },
      { courseTitle: "Statistical Ethics & Confidentiality", provider: "NSSTA", completedDate: "Jun 2025", competencyCode: "BH-INTEGRITY-001", levelAchieved: 3 },
    ],
    joinDate: "Jul 2024",
  },
  {
    id: "user_so_delhi",
    name: "Rohit Verma",
    email: "r.verma@mospi.gov.in",
    designation: "Senior Statistical Officer",
    cadreRank: "SO",
    region: "Central Secretariat New Delhi",
    division: "NAD (National Accounts Division)",
    igotUserId: "igot_usr_44102",
    avatar: "RV",
    department: "Ministry of Statistics & Programme Implementation",
    jobRole: "National Accounts Analyst & Survey Supervisor",
    currentAssignment: "GDP Estimation — NAD Q2 FY2027",
    educationQualification: "M.A. Economics, Delhi School of Economics",
    experienceLevel: "3-5",
    experienceYears: 4,
    previousTraining: [
      { courseTitle: "NSSO Multistage Sampling", provider: "SDRD", completedDate: "Aug 2023", competencyCode: "FN-STAT-014", levelAchieved: 4 },
      { courseTitle: "SNA 2008 GVA Compilation", provider: "NSSTA", completedDate: "Feb 2024", competencyCode: "FN-STAT-021", levelAchieved: 3 },
      { courseTitle: "R for Official Statistical Data", provider: "DQAD", completedDate: "Nov 2024", competencyCode: "FN-STAT-033", levelAchieved: 3 },
      { courseTitle: "CPI Advanced Methods", provider: "NSSTA", completedDate: "May 2025", competencyCode: "DM-PRICE-002", levelAchieved: 4 },
      { courseTitle: "Data Visualization Workshop", provider: "NSSTA", completedDate: "Jul 2025", competencyCode: "TC-DATAVIZ-001", levelAchieved: 3 },
    ],
    joinDate: "Apr 2022",
  },
  {
    id: "user_dd_kolkata",
    name: "Dr. Sunita Iyer",
    email: "s.iyer@mospi.gov.in",
    designation: "Deputy Director",
    cadreRank: "DD",
    region: "Eastern Regional Centre Kolkata",
    division: "ESD (Economic Statistics Division)",
    igotUserId: "igot_usr_11209",
    avatar: "SI",
    department: "Ministry of Statistics & Programme Implementation",
    jobRole: "Division Head & Policy Analyst",
    currentAssignment: "Annual Survey of Industries (ASI) — Eastern Zone Supervision",
    educationQualification: "Ph.D. Applied Statistics, ISI Kolkata",
    experienceLevel: "5+",
    experienceYears: 12,
    previousTraining: [
      { courseTitle: "NSSO Advanced Sampling Theory", provider: "ISI Kolkata", completedDate: "Mar 2018", competencyCode: "FN-STAT-014", levelAchieved: 5 },
      { courseTitle: "SNA 2008 Full Implementation", provider: "NSSTA", completedDate: "Jul 2019", competencyCode: "FN-STAT-021", levelAchieved: 5 },
      { courseTitle: "Python for Microdata Analysis", provider: "DQAD", completedDate: "Jan 2022", competencyCode: "FN-STAT-033", levelAchieved: 4 },
      { courseTitle: "Statistical Leadership Programme", provider: "LBSNAA", completedDate: "Nov 2023", competencyCode: "BH-LEAD-001", levelAchieved: 4 },
      { courseTitle: "GIS for Statistical Operations", provider: "NSSTA", completedDate: "Apr 2024", competencyCode: "TC-GIS-001", levelAchieved: 3 },
      { courseTitle: "e-Governance Digital India", provider: "DeitY", completedDate: "Sep 2025", competencyCode: "DG-EGOV-001", levelAchieved: 4 },
    ],
    joinDate: "Aug 2014",
  },
];

// Target level baselines per cadre rank (1-5 scale)
export const CADRE_BASELINES: Record<"JSO" | "SO" | "DD", Record<string, number>> = {
  JSO: {
    "FN-STAT-014": 4, // Survey Sampling Design
    "DM-PRICE-002": 3, // Price Statistics
    "FN-STAT-021": 3, // National Income Accounting
    "FN-STAT-033": 4, // R/Python for Survey Processing
    "BH-INTEGRITY-001": 5, // Data Integrity
    "FN-STAT-042": 3, // IIP / Industrial Indexing
  },
  SO: {
    "FN-STAT-014": 5,
    "DM-PRICE-002": 4,
    "FN-STAT-021": 4,
    "FN-STAT-033": 5,
    "BH-INTEGRITY-001": 5,
    "FN-STAT-042": 4,
  },
  DD: {
    "FN-STAT-014": 5,
    "DM-PRICE-002": 5,
    "FN-STAT-021": 5,
    "FN-STAT-033": 5,
    "BH-INTEGRITY-001": 5,
    "FN-STAT-042": 5,
  },
};

// ──────────────────────────────────────────────
// Initial officer proficiencies — 12 competencies per officer
// spanning Statistical, Technical, Digital Governance & Behavioural categories
// ──────────────────────────────────────────────
export const INITIAL_OFFICER_COMPETENCIES: Record<string, CompetencyItem[]> = {
  user_jso_pune: [
    { id: "c1", fracCode: "FN-STAT-014", label: "Survey Sampling Design", category: "FUNCTIONAL", description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)", current: 3, target: 3, lastAssessed: "12 Aug 2026" },
    { id: "c2", fracCode: "DM-PRICE-002", label: "Price Statistics (CPI/WPI)", category: "DOMAIN", description: "Laspeyres/Jevons index compilation & rural/urban price aggregation", current: 2, target: 3, lastAssessed: "02 Jul 2026" },
    { id: "c3", fracCode: "FN-STAT-021", label: "National Income Accounting", category: "DOMAIN", description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations", current: 2, target: 3, lastAssessed: "28 May 2026" },
    { id: "c4", fracCode: "FN-STAT-033", label: "R/Python for Survey Processing", category: "FUNCTIONAL", description: "Automated unit-level data validation & microdata tabulation", current: 4, target: 3, lastAssessed: "19 Aug 2026" },
    { id: "c5", fracCode: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", category: "BEHAVIORAL", description: "Official Statistics Confidentiality under Collection of Statistics Act 2008", current: 4, target: 4, lastAssessed: "05 Jun 2026" },
    { id: "c6", fracCode: "FN-STAT-042", label: "Industrial Production Indexing", category: "DOMAIN", description: "Annual Survey of Industries (ASI) and IIP item weight adjustment", current: 2, target: 3, lastAssessed: "14 Jul 2026" },
    { id: "c7", fracCode: "TC-DATAVIZ-001", label: "Data Visualization & Dashboarding", category: "TECHNICAL", description: "Tableau, Power BI and D3.js for statistical report visualisation", current: 2, target: 3, lastAssessed: "20 Jul 2026" },
    { id: "c8", fracCode: "TC-SQL-001", label: "SQL & Database Management", category: "TECHNICAL", description: "Relational database querying for microdata and frame management", current: 1, target: 3, lastAssessed: "15 Jun 2026" },
    { id: "c9", fracCode: "DG-EGOV-001", label: "e-Governance & Digital India Platforms", category: "DIGITAL_GOV", description: "Government e-Marketplace, UMANG, DigiLocker, and API Setu integration", current: 2, target: 3, lastAssessed: "08 Aug 2026" },
    { id: "c10", fracCode: "TC-GIS-001", label: "GIS & Geospatial Analysis", category: "TECHNICAL", description: "QGIS/ArcGIS for spatial mapping of statistical survey regions", current: 1, target: 2, lastAssessed: "22 May 2026" },
    { id: "c11", fracCode: "BH-COMM-001", label: "Communication & Report Writing", category: "BEHAVIORAL", description: "Drafting statistical bulletins, press releases, and data briefs", current: 3, target: 3, lastAssessed: "01 Aug 2026" },
    { id: "c12", fracCode: "BH-LEAD-001", label: "Leadership & Team Coordination", category: "BEHAVIORAL", description: "FOD field team supervision and inter-division coordination", current: 1, target: 2, lastAssessed: "10 Jul 2026" },
  ],
  user_so_delhi: [
    { id: "c1", fracCode: "FN-STAT-014", label: "Survey Sampling Design", category: "FUNCTIONAL", description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)", current: 4, target: 5, lastAssessed: "15 Aug 2026" },
    { id: "c2", fracCode: "DM-PRICE-002", label: "Price Statistics (CPI/WPI)", category: "DOMAIN", description: "Laspeyres/Jevons index compilation & rural/urban price aggregation", current: 4, target: 4, lastAssessed: "10 Aug 2026" },
    { id: "c3", fracCode: "FN-STAT-021", label: "National Income Accounting", category: "DOMAIN", description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations", current: 3, target: 5, lastAssessed: "21 Jul 2026" },
    { id: "c4", fracCode: "FN-STAT-033", label: "R/Python for Survey Processing", category: "FUNCTIONAL", description: "Automated unit-level data validation & microdata tabulation", current: 3, target: 5, lastAssessed: "02 Aug 2026" },
    { id: "c5", fracCode: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", category: "BEHAVIORAL", description: "Official Statistics Confidentiality under Collection of Statistics Act 2008", current: 5, target: 5, lastAssessed: "12 May 2026" },
    { id: "c6", fracCode: "FN-STAT-042", label: "Industrial Production Indexing", category: "DOMAIN", description: "Annual Survey of Industries (ASI) and IIP item weight adjustment", current: 4, target: 5, lastAssessed: "30 Jun 2026" },
    { id: "c7", fracCode: "TC-DATAVIZ-001", label: "Data Visualization & Dashboarding", category: "TECHNICAL", description: "Tableau, Power BI and D3.js for statistical report visualisation", current: 3, target: 5, lastAssessed: "18 Jul 2026" },
    { id: "c8", fracCode: "TC-SQL-001", label: "SQL & Database Management", category: "TECHNICAL", description: "Relational database querying for microdata and frame management", current: 3, target: 5, lastAssessed: "25 Jun 2026" },
    { id: "c9", fracCode: "DG-EGOV-001", label: "e-Governance & Digital India Platforms", category: "DIGITAL_GOV", description: "Government e-Marketplace, UMANG, DigiLocker, and API Setu integration", current: 3, target: 4, lastAssessed: "05 Aug 2026" },
    { id: "c10", fracCode: "TC-GIS-001", label: "GIS & Geospatial Analysis", category: "TECHNICAL", description: "QGIS/ArcGIS for spatial mapping of statistical survey regions", current: 2, target: 4, lastAssessed: "12 Jun 2026" },
    { id: "c11", fracCode: "BH-COMM-001", label: "Communication & Report Writing", category: "BEHAVIORAL", description: "Drafting statistical bulletins, press releases, and data briefs", current: 4, target: 5, lastAssessed: "28 Jul 2026" },
    { id: "c12", fracCode: "BH-LEAD-001", label: "Leadership & Team Coordination", category: "BEHAVIORAL", description: "FOD field team supervision and inter-division coordination", current: 3, target: 4, lastAssessed: "20 Jun 2026" },
  ],
  user_dd_kolkata: [
    { id: "c1", fracCode: "FN-STAT-014", label: "Survey Sampling Design", category: "FUNCTIONAL", description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)", current: 5, target: 5, lastAssessed: "01 Aug 2026" },
    { id: "c2", fracCode: "DM-PRICE-002", label: "Price Statistics (CPI/WPI)", category: "DOMAIN", description: "Laspeyres/Jevons index compilation & rural/urban price aggregation", current: 4, target: 5, lastAssessed: "18 Jul 2026" },
    { id: "c3", fracCode: "FN-STAT-021", label: "National Income Accounting", category: "DOMAIN", description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations", current: 5, target: 5, lastAssessed: "25 Aug 2026" },
    { id: "c4", fracCode: "FN-STAT-033", label: "R/Python for Survey Processing", category: "FUNCTIONAL", description: "Automated unit-level data validation & microdata tabulation", current: 4, target: 5, lastAssessed: "11 Aug 2026" },
    { id: "c5", fracCode: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", category: "BEHAVIORAL", description: "Official Statistics Confidentiality under Collection of Statistics Act 2008", current: 5, target: 5, lastAssessed: "10 Jun 2026" },
    { id: "c6", fracCode: "FN-STAT-042", label: "Industrial Production Indexing", category: "DOMAIN", description: "Annual Survey of Industries (ASI) and IIP item weight adjustment", current: 4, target: 5, lastAssessed: "14 Jul 2026" },
    { id: "c7", fracCode: "TC-DATAVIZ-001", label: "Data Visualization & Dashboarding", category: "TECHNICAL", description: "Tableau, Power BI and D3.js for statistical report visualisation", current: 4, target: 5, lastAssessed: "22 Jul 2026" },
    { id: "c8", fracCode: "TC-SQL-001", label: "SQL & Database Management", category: "TECHNICAL", description: "Relational database querying for microdata and frame management", current: 4, target: 5, lastAssessed: "05 Jul 2026" },
    { id: "c9", fracCode: "DG-EGOV-001", label: "e-Governance & Digital India Platforms", category: "DIGITAL_GOV", description: "Government e-Marketplace, UMANG, DigiLocker, and API Setu integration", current: 4, target: 5, lastAssessed: "15 Aug 2026" },
    { id: "c10", fracCode: "TC-GIS-001", label: "GIS & Geospatial Analysis", category: "TECHNICAL", description: "QGIS/ArcGIS for spatial mapping of statistical survey regions", current: 3, target: 5, lastAssessed: "28 Jun 2026" },
    { id: "c11", fracCode: "BH-COMM-001", label: "Communication & Report Writing", category: "BEHAVIORAL", description: "Drafting statistical bulletins, press releases, and data briefs", current: 5, target: 5, lastAssessed: "02 Aug 2026" },
    { id: "c12", fracCode: "BH-LEAD-001", label: "Leadership & Team Coordination", category: "BEHAVIORAL", description: "FOD field team supervision and inter-division coordination", current: 4, target: 5, lastAssessed: "18 Jul 2026" },
  ],
};

// Available MoSPI Training Handbooks
export const PRELOADED_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc_plfs_2024",
    title: "Periodic Labour Force Survey (PLFS) — Operational Guidelines & Sampling",
    sourceType: "PLFS_HANDBOOK",
    pageCount: 148,
    fileSizeKb: 3420,
    chunkCount: 184,
    uploadedAt: "01 Sep 2026",
    status: "READY",
    summary: "Standard operational manual for field enumerators and supervisors detailing rotational panel sampling, first-stage units (FSUs), and activity status determination.",
  },
  {
    id: "doc_cpi_manual",
    title: "All-India Consumer Price Index (CPI Rural/Urban) — Compilation Manual",
    sourceType: "CPI_METHODOLOGY",
    pageCount: 92,
    fileSizeKb: 2150,
    chunkCount: 116,
    uploadedAt: "28 Aug 2026",
    status: "READY",
    summary: "Methodological framework detailing Laspeyres basket weighting, Jevons elementary aggregate index, missing price imputation, and house rent survey indices.",
  },
  {
    id: "doc_nas_sna",
    title: "National Accounts Statistics — Sources and Methods (SNA 2008 Implementation)",
    sourceType: "NATIONAL_ACCOUNTS_MANUAL",
    pageCount: 220,
    fileSizeKb: 5890,
    chunkCount: 275,
    uploadedAt: "15 Aug 2026",
    status: "READY",
    summary: "System of National Accounts methodology covering institutional sector classification, Gross Fixed Capital Formation (GFCF), and financial intermediation services (FISIM).",
  },
  {
    id: "doc_asi_manual",
    title: "Annual Survey of Industries (ASI) — Volume 1 Methodology & Frame Design",
    sourceType: "ASI_METHODOLOGY",
    pageCount: 110,
    fileSizeKb: 2840,
    chunkCount: 142,
    uploadedAt: "05 Aug 2026",
    status: "READY",
    summary: "Factories Act 1948 frame maintenance, census vs sample sector allocation, working capital computation, and ex-factory value determination.",
  },
];

// iGOT Karmayogi Course Directory
export const IGOT_COURSE_CATALOG: IgotCourse[] = [
  {
    id: "rec_1",
    igotCourseId: "do_11305891234567",
    courseTitle: "CPI Compilation: Advanced Index Methods & Elementary Aggregates",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "DM-PRICE-002",
    competencyLabel: "Price Statistics (CPI/WPI)",
    matchScore: 0.92,
    durationHours: 6,
    provider: "National Statistical Systems Training Academy (NSSTA)",
    status: "RECOMMENDED",
  },
  {
    id: "rec_2",
    igotCourseId: "do_11305897654321",
    courseTitle: "National Accounts: Sources, GVA Compilation & Deflators",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "FN-STAT-021",
    competencyLabel: "National Income Accounting",
    matchScore: 0.88,
    durationHours: 8,
    provider: "National Accounts Division (NAD) & NSSTA",
    status: "RECOMMENDED",
  },
  {
    id: "rec_3",
    igotCourseId: "do_11305893322114",
    courseTitle: "NSSO Multistage Sampling & Sample Frame Allocation",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "FN-STAT-014",
    competencyLabel: "Survey Sampling Design",
    matchScore: 0.95,
    durationHours: 10,
    provider: "Survey Design & Research Division (SDRD)",
    status: "RECOMMENDED",
  },
  {
    id: "rec_4",
    igotCourseId: "do_11305899988776",
    courseTitle: "R & Python for Official Statistical Data Validation",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "FN-STAT-033",
    competencyLabel: "R/Python for Survey Processing",
    matchScore: 0.84,
    durationHours: 12,
    provider: "Data Quality Assurance Division (DQAD)",
    status: "RECOMMENDED",
  },
  {
    id: "rec_5",
    igotCourseId: "do_11305895544332",
    courseTitle: "Statutory Data Ethics under the Collection of Statistics Act 2008",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "BH-INTEGRITY-001",
    competencyLabel: "Data Integrity & Ethics",
    matchScore: 0.81,
    durationHours: 4,
    provider: "Ministry of Statistics & Programme Implementation",
    status: "RECOMMENDED",
  },
  {
    id: "rec_6",
    igotCourseId: "do_11305896677889",
    courseTitle: "Annual Survey of Industries: Ex-factory Valuation & Frame Sampling",
    courseUrl: "https://igotkarmayogi.gov.in/",
    competencyFracCode: "FN-STAT-042",
    competencyLabel: "Industrial Production Indexing",
    matchScore: 0.89,
    durationHours: 7,
    provider: "Economic Statistics Division (ESD)",
    status: "RECOMMENDED",
  },
];

// Curated Grounded MCQs linked to source documents (expanded 90+ item bank)
import { SAMPLE_QUESTIONS_DATABASE } from "./question-bank";
export { SAMPLE_QUESTIONS_DATABASE };



// Cadre-wide statistics for the Training Division (TD) Admin Dashboard
export const TD_CADRE_HEATMAP_DATA = [
  {
    division: "FOD (Field Operations)",
    totalOfficers: 418,
    cadreBreakdown: "279 JSO · 109 SO · 30 DD",
    competencies: [
      { code: "FN-STAT-014", label: "Survey Sampling Design", gapPercent: 68 },
      { code: "FN-STAT-033", label: "R/Python for Survey Data", gapPercent: 74 },
      { code: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", gapPercent: 18 },
      { code: "DM-PRICE-002", label: "Price Statistics (CPI)", gapPercent: 44 },
    ],
  },
  {
    division: "NAD (National Accounts)",
    totalOfficers: 176,
    cadreBreakdown: "44 JSO · 83 SO · 49 DD",
    competencies: [
      { code: "FN-STAT-021", label: "National Income Accounting", gapPercent: 58 },
      { code: "FN-STAT-033", label: "R/Python for Survey Data", gapPercent: 52 },
      { code: "DM-PRICE-002", label: "Price Statistics (CPI)", gapPercent: 32 },
      { code: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", gapPercent: 12 },
    ],
  },
  {
    division: "ESD (Economic Statistics)",
    totalOfficers: 213,
    cadreBreakdown: "91 JSO · 81 SO · 41 DD",
    competencies: [
      { code: "FN-STAT-042", label: "Industrial Indexing (IIP/ASI)", gapPercent: 64 },
      { code: "DM-PRICE-002", label: "Price Statistics (CPI)", gapPercent: 61 },
      { code: "FN-STAT-033", label: "R/Python for Survey Data", gapPercent: 48 },
      { code: "FN-STAT-014", label: "Survey Sampling Design", gapPercent: 29 },
    ],
  },
  {
    division: "DQAD (Data Quality Assurance)",
    totalOfficers: 141,
    cadreBreakdown: "50 JSO · 60 SO · 31 DD",
    competencies: [
      { code: "FN-STAT-033", label: "R/Python for Survey Data", gapPercent: 42 },
      { code: "FN-STAT-014", label: "Survey Sampling Design", gapPercent: 35 },
      { code: "BH-INTEGRITY-001", label: "Data Integrity & Ethics", gapPercent: 8 },
      { code: "DM-PRICE-002", label: "Price Statistics (CPI)", gapPercent: 26 },
    ],
  },
];

export interface StoredChunk {
  id: string;
  documentId: string;
  ordinal: number;
  content: string;
  headingPath: string[];
  embedding?: number[];
}

// Global in-memory registry for runtime documents & chunks (persisted across route bundles)
const globalForData = globalThis as unknown as {
  GLOBAL_DOCUMENTS?: Map<string, DocumentItem>;
  GLOBAL_CHUNKS?: Map<string, StoredChunk[]>;
};

const GLOBAL_DOCUMENTS =
  globalForData.GLOBAL_DOCUMENTS ??
  new Map<string, DocumentItem>(PRELOADED_DOCUMENTS.map((doc) => [doc.id, doc]));

const GLOBAL_CHUNKS =
  globalForData.GLOBAL_CHUNKS ??
  new Map<string, StoredChunk[]>([
  [
    "doc_plfs_2024",
    [
      {
        id: "chunk_plfs_1",
        documentId: "doc_plfs_2024",
        ordinal: 1,
        headingPath: ["Chapter 2: Sampling Scheme", "2.1 Sampling Frame"],
        content:
          "The 2011 Population Census list of villages serves as the sampling frame for rural areas. For urban areas, the latest Urban Frame Survey (UFS) blocks maintained by NSSO FOD are utilized as First Stage Units (FSUs).",
      },
      {
        id: "chunk_plfs_2",
        documentId: "doc_plfs_2024",
        ordinal: 2,
        headingPath: ["Chapter 2: Sampling Scheme", "2.4 Urban Rotational Design"],
        content:
          "In urban areas, a rotational panel sampling design is used. Each selected urban frame unit is surveyed for a duration of four consecutive quarters, yielding a panel structure where 75% of sample units match between adjacent quarters.",
      },
      {
        id: "chunk_plfs_3",
        documentId: "doc_plfs_2024",
        ordinal: 3,
        headingPath: ["Chapter 3: Concepts & Definitions", "3.12 Current Weekly Status"],
        content:
          "Under Current Weekly Status (CWS), a person who engaged in any gainful work activity for 1 hour or more on at least one day during the preceding 7 days is categorized as working (or employed).",
      },
      {
        id: "chunk_plfs_4",
        documentId: "doc_plfs_2024",
        ordinal: 4,
        headingPath: ["Chapter 4: Stratification & Allocation", "4.2 District Stratum"],
        content:
          "Each district in a State/UT constitutes a basic stratum. In rural areas, sub-strata are formed based on population size of villages. In urban areas, UFS blocks are stratified by MPCE and demographic density.",
      },
    ],
  ],
  [
    "doc_cpi_manual",
    [
      {
        id: "chunk_cpi_1",
        documentId: "doc_cpi_manual",
        ordinal: 1,
        headingPath: ["Chapter 4: Computation Methodology", "4.2 Elementary Index Formula"],
        content:
          "Elementary aggregate indices are computed using the Jevons formula: the unweighted geometric mean of price relatives of quoted markets across villages/towns within the district/state.",
      },
      {
        id: "chunk_cpi_2",
        documentId: "doc_cpi_manual",
        ordinal: 2,
        headingPath: ["Chapter 5: Missing Prices & Quality Adjustment", "5.3 Imputation"],
        content:
          "If a specified variety is temporarily not traded, its price is imputed using the short-term percentage change of prices of other reporting outlets in the same stratum for that specific item.",
      },
      {
        id: "chunk_cpi_3",
        documentId: "doc_cpi_manual",
        ordinal: 3,
        headingPath: ["Chapter 6: Aggregation & Weighting", "6.1 Laspeyres Aggregation"],
        content:
          "Subgroup and group indices are aggregated up to the all-India level using fixed base-period consumer expenditure weights derived from the Consumer Expenditure Survey (CES) via modified Laspeyres formula.",
      },
    ],
  ],
  [
    "doc_nas_sna",
    [
      {
        id: "chunk_nas_1",
        documentId: "doc_nas_sna",
        ordinal: 1,
        headingPath: ["Chapter 1: Basic Concepts", "1.2 National Product Definition"],
        content:
          "National product by definition is a measure in monetary terms of the volume of all goods and services produced by an economy during a given period of time, accounted without duplication. It covers all goods and services produced by residents of a country.",
      },
      {
        id: "chunk_nas_2",
        documentId: "doc_nas_sna",
        ordinal: 2,
        headingPath: ["Chapter 2: GDP Overview", "2.2 Three Approaches to GDP"],
        content:
          "There are three equivalent approaches to measure GDP: production, income, and expenditure. Production approach GDP measures the sum of gross value added of all economic activities (output minus intermediate consumption) plus net taxes on products. Income approach GDP is the sum of compensation of employees, gross operating surplus, and gross mixed income plus taxes net of subsidies on production. Expenditure approach GDP comprises GFCE, PFCE, GFCF, Change in Stocks, and Net Exports.",
      },
      {
        id: "chunk_nas_3",
        documentId: "doc_nas_sna",
        ordinal: 3,
        headingPath: ["Chapter 2: Valuation of Output", "2.27 Basic Prices vs Producer's Prices"],
        content:
          "The basic price is the amount receivable by the producer from the purchaser for a unit of a good or service produced as output minus any tax payable, and plus any subsidy receivable, on that unit as a consequence of its production or sale. It excludes any transport charges invoiced separately. Producer's price includes taxes on products (minus subsidies) but excludes invoiced VAT.",
      },
      {
        id: "chunk_nas_4",
        documentId: "doc_nas_sna",
        ordinal: 4,
        headingPath: ["Chapter 2: Value Added", "2.33 Gross Value Added at Factor Cost"],
        content:
          "Gross Value Added at factor cost is derived from Gross Value Added at basic prices by subtracting 'other taxes, less subsidies, on production'. Other taxes on production are taxes payable by employers to carry out production irrespective of sales or profitability, such as payroll taxes or taxes on vehicles and buildings.",
      },
      {
        id: "chunk_nas_5",
        documentId: "doc_nas_sna",
        ordinal: 5,
        headingPath: ["Chapter 3: State & District Income", "3.5 Income Originating Approach"],
        content:
          "State Domestic Product (SDP) and District Domestic Product (DDP) are compiled following the income originating approach, which measures net value of goods and services produced within the geographical boundaries of the State or District. Income accruing approach measures income received by normal residents, but cannot be compiled due to lack of inter-state and inter-district cash flow data.",
      },
      {
        id: "chunk_nas_6",
        documentId: "doc_nas_sna",
        ordinal: 6,
        headingPath: ["Chapter 3: Fixed Capital", "3.14 Consumption of Fixed Capital (CFC)"],
        content:
          "Consumption of Fixed Capital (CFC) measures the replacement value of the part of capital stock used up in the production process. At the national level, CFC is estimated on a straight-line basis via the Perpetual Inventory Method (PIM) with reference to expected economic asset life. CSO allocates national CFC estimates to States using proxy indicators.",
      },
      {
        id: "chunk_nas_7",
        documentId: "doc_nas_sna",
        ordinal: 7,
        headingPath: ["Chapter 3 / Appendix 1", "Supra-Regional Sectors"],
        content:
          "Activities that transcend state boundaries—Railways, Communications, Banking & Insurance, and Central Government Administration—are designated as Supra-Regional sectors. Their economic contribution is compiled for the country as a whole by CSO and allocated to states using specific physical and operational indicators.",
      },
      {
        id: "chunk_nas_8",
        documentId: "doc_nas_sna",
        ordinal: 8,
        headingPath: ["Chapter 5 & Appendix 2", "Labour Input Method & VAPW"],
        content:
          "For unorganized segments of manufacturing, trade, hotels, transport, and private services where direct output and input data are absent, GVA is estimated using the Labour Input Method (LIM): the product of estimated workforce (from NSSO Employment-Unemployment Surveys and Census) and Value Added Per Worker (VAPW) from NSSO Enterprise Surveys.",
      },
      {
        id: "chunk_nas_9",
        documentId: "doc_nas_sna",
        ordinal: 9,
        headingPath: ["Appendix 3: Capital Formation", "Gross Fixed Capital Formation (GFCF)"],
        content:
          "Gross Fixed Capital Formation (GFCF) is measured by total additions to fixed tangible assets (dwellings, non-residential buildings, machinery, cultivated assets) and intangible fixed assets (software, mineral exploration). At the state level, GFCF is primarily estimated via the expenditure approach and commodity flow approach.",
      },
      {
        id: "chunk_nas_10",
        documentId: "doc_nas_sna",
        ordinal: 10,
        headingPath: ["Chapter 2: Intermediate Consumption", "2.18 Definition and Exclusions"],
        content:
          "Intermediate consumption consists of the value of goods and services consumed as inputs by a process of production, valued at purchasers' prices. It excludes fixed assets whose consumption is recorded as CFC, and expenditures on valuables (works of art, precious metals) which are recorded in capital accounts.",
      },
    ],
  ],
  [
    "doc_asi_manual",
    [
      {
        id: "chunk_asi_1",
        documentId: "doc_asi_manual",
        ordinal: 1,
        headingPath: ["Chapter 2: Sampling Frame & Stratification", "2.2 Census vs Sample"],
        content:
          "The ASI frame consists of the Census Sector and Sample Sector. The Census Sector covers all factories employing 100 or more workers across the 6 major industrial states, as well as all factories in less-industrialized states.",
      },
    ],
  ],
]);

globalForData.GLOBAL_DOCUMENTS = GLOBAL_DOCUMENTS;
globalForData.GLOBAL_CHUNKS = GLOBAL_CHUNKS;

export function getStoredDocuments(): DocumentItem[] {
  return Array.from(GLOBAL_DOCUMENTS.values());
}

export function getStoredDocument(id: string): DocumentItem | undefined {
  return GLOBAL_DOCUMENTS.get(id);
}

export function addStoredDocument(doc: DocumentItem): void {
  GLOBAL_DOCUMENTS.set(doc.id, doc);
}

export function getStoredChunks(documentId: string): StoredChunk[] {
  return GLOBAL_CHUNKS.get(documentId) || [];
}

export function addStoredChunks(documentId: string, chunks: StoredChunk[]): void {
  const existing = GLOBAL_CHUNKS.get(documentId) || [];
  GLOBAL_CHUNKS.set(documentId, [...existing, ...chunks]);
}

export function getAllStoredChunks(): StoredChunk[] {
  const all: StoredChunk[] = [];
  for (const chunks of GLOBAL_CHUNKS.values()) {
    all.push(...chunks);
  }
  return all;
}

/**
 * Maps a document's sourceType or title to its corresponding FRAC competency code
 */
export function getCompetencyForDocument(doc: {
  sourceType?: string;
  title?: string;
}): string {
  const type = doc.sourceType || "";
  const title = (doc.title || "").toLowerCase();

  if (
    type === "NATIONAL_ACCOUNTS_MANUAL" ||
    title.includes("national") ||
    title.includes("account") ||
    title.includes("sna") ||
    title.includes("gdp") ||
    title.includes("gva") ||
    title.includes("income") ||
    title.includes("sdp") ||
    title.includes("ddp")
  ) {
    return "FN-STAT-021"; // National Income Accounting
  }

  if (
    type === "CPI_METHODOLOGY" ||
    title.includes("cpi") ||
    title.includes("price") ||
    title.includes("inflation") ||
    title.includes("wpi")
  ) {
    return "DM-PRICE-002"; // Price Statistics (CPI/WPI)
  }

  if (
    type === "ASI_METHODOLOGY" ||
    title.includes("asi") ||
    title.includes("industry") ||
    title.includes("factory") ||
    title.includes("iip")
  ) {
    return "FN-STAT-042"; // Industrial Production Indexing
  }

  if (
    title.includes("python") ||
    title.includes("r script") ||
    title.includes("processing") ||
    title.includes("software") ||
    title.includes("coding")
  ) {
    return "FN-STAT-033"; // R/Python for Survey Processing
  }

  if (
    title.includes("ethics") ||
    title.includes("integrity") ||
    title.includes("confidential")
  ) {
    return "BH-INTEGRITY-001"; // Data Integrity & Ethics
  }

  return "FN-STAT-014"; // Survey Sampling Design (Default / PLFS)
}

/**
 * Registers an uploaded or custom document, creates matching chunks,
 * and populates document-specific questions in SAMPLE_QUESTIONS_DATABASE
 */
export function registerDocumentQuestions(doc: DocumentItem): void {
  addStoredDocument(doc);

  const fracCode = getCompetencyForDocument(doc);
  const allSampleQuestions = Object.values(SAMPLE_QUESTIONS_DATABASE).flat();
  const matchingQuestions = allSampleQuestions.filter(
    (q) => q.competencyFracCode === fracCode
  );

  const customizedQuestions: AssessmentQuestion[] = (
    matchingQuestions.length > 0 ? matchingQuestions : allSampleQuestions.slice(0, 4)
  ).map((q, idx) => ({
    ...q,
    id: `q_${doc.id}_${idx + 1}`,
    sourceDocument: doc.title,
  }));

  SAMPLE_QUESTIONS_DATABASE[doc.id] = customizedQuestions;
}

/**
 * Competency-first, difficulty-aware question resolver:
 * Prioritizes questions matching the requested competency and difficulty level,
 * shuffles items to provide variety on each run, and GUARANTEES the requested question count.
 */
export function resolveQuestionsForQuiz(params: {
  documentId?: string;
  competencyFracCode?: string;
  questionCount?: number;
  difficulty?: number;
  bloomLevel?: string;
}): AssessmentQuestion[] {
  const {
    documentId,
    competencyFracCode,
    questionCount = 3,
    difficulty = 3,
    bloomLevel,
  } = params;

  const targetCount = Math.max(1, questionCount);
  const targetDiff = Math.min(5, Math.max(1, difficulty));

  const allQuestions = Object.values(SAMPLE_QUESTIONS_DATABASE).flat();

  // 1. Identify candidate pool for target competency / document
  let candidatePool: AssessmentQuestion[] = [];

  if (competencyFracCode) {
    if (documentId && SAMPLE_QUESTIONS_DATABASE[documentId]) {
      const docMatching = SAMPLE_QUESTIONS_DATABASE[documentId].filter(
        (q) => q.competencyFracCode === competencyFracCode
      );
      if (docMatching.length > 0) {
        candidatePool = [...docMatching];
      }
    }

    if (candidatePool.length === 0) {
      const compMatching = allQuestions.filter(
        (q) => q.competencyFracCode === competencyFracCode
      );
      if (compMatching.length > 0) {
        candidatePool = [...compMatching];
      }
    }
  }

  if (candidatePool.length === 0 && documentId) {
    if (SAMPLE_QUESTIONS_DATABASE[documentId]?.length > 0) {
      candidatePool = [...SAMPLE_QUESTIONS_DATABASE[documentId]];
    } else {
      const doc = getStoredDocument(documentId) || PRELOADED_DOCUMENTS.find((d) => d.id === documentId);
      if (doc) {
        const mappedFrac = getCompetencyForDocument(doc);
        const mapped = allQuestions.filter((q) => q.competencyFracCode === mappedFrac);
        if (mapped.length > 0) {
          candidatePool = [...mapped];
        }
      }
    }
  }

  if (candidatePool.length === 0) {
    candidatePool = [...allQuestions];
  }

  // 2. Fisher-Yates shuffle helper
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 3. Multi-tier difficulty grouping:
  // Tier 0: exact difficulty (|q.difficulty - targetDiff| === 0)
  // Tier 1: 1 level away (|q.difficulty - targetDiff| === 1)
  // Tier 2: 2 levels away, etc.
  const tiers: AssessmentQuestion[][] = [[], [], [], [], []];
  for (const q of candidatePool) {
    const dist = Math.abs((q.difficulty || 3) - targetDiff);
    const tierIdx = Math.min(4, Math.max(0, dist));
    tiers[tierIdx].push(q);
  }

  const selected: AssessmentQuestion[] = [];
  const selectedIds = new Set<string>();

  for (let t = 0; t <= 4 && selected.length < targetCount; t++) {
    let tierQuestions = tiers[t];
    if (tierQuestions.length === 0) continue;

    if (bloomLevel) {
      const bloomNorm = bloomLevel.toUpperCase();
      const bloomMatches = tierQuestions.filter((q) => q.bloomLevel?.toUpperCase() === bloomNorm);
      const otherMatches = tierQuestions.filter((q) => q.bloomLevel?.toUpperCase() !== bloomNorm);
      tierQuestions = [...shuffle(bloomMatches), ...shuffle(otherMatches)];
    } else {
      tierQuestions = shuffle(tierQuestions);
    }

    for (const q of tierQuestions) {
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
        if (selected.length >= targetCount) break;
      }
    }
  }

  // 4. Backfill from remaining questions pool if needed
  if (selected.length < targetCount) {
    const remaining = shuffle(allQuestions.filter((q) => !selectedIds.has(q.id)));
    for (const q of remaining) {
      selected.push(q);
      selectedIds.add(q.id);
      if (selected.length >= targetCount) break;
    }
  }

  // 5. Procedural fallback guarantee to ensure selected.length === targetCount
  let counter = 1;
  while (selected.length < targetCount) {
    const fallbackFrac = competencyFracCode || "FN-STAT-014";
    selected.push({
      id: `q_gen_${Date.now()}_${counter}`,
      stem: `Under MoSPI Cadre Standards for ${fallbackFrac}, which operational protocol is vital when executing diagnostic methodology at Difficulty Level ${targetDiff}?`,
      choices: [
        { id: "A", text: "Strict compliance with probability sampling frames and designated field schedules." },
        { id: "B", text: "Informal substitution of unreachable sample units without FOD supervisor notification." },
        { id: "C", text: "Omission of rural stratum weights to expedite quarterly tabulation." },
        { id: "D", text: "Application of arbitrary multipliers without reference to census baselines." },
      ],
      correctChoice: "A",
      rationale: "MoSPI standard operating guidelines mandate strict adherence to established statistical protocols and verified sampling frames to prevent non-sampling bias.",
      bloomLevel: (bloomLevel?.toUpperCase() as any) || (targetDiff >= 4 ? "ANALYZE" : "APPLY"),
      difficulty: targetDiff,
      competencyFracCode: fallbackFrac,
      competencyLabel: `Competency ${fallbackFrac}`,
      sourceDocument: "MoSPI Statistical Guidelines & Standards",
      sourceCitation: `Chapter ${targetDiff}: Operational Procedures, Section ${targetDiff}.2`,
      sourceSnippet: "Adherence to standardized sampling protocols is statutory under NSSO FOD operational guidelines.",
    });
    counter++;
  }

  const doc = documentId
    ? getStoredDocument(documentId) || PRELOADED_DOCUMENTS.find((d) => d.id === documentId)
    : null;

  const resolved = selected.slice(0, targetCount).map((q) => ({
    ...q,
    sourceDocument: doc && doc.title ? doc.title : q.sourceDocument,
  }));

  return randomizeQuizQuestions(resolved);
}

/**
 * Randomizes the choices (A, B, C, D) for each question in a quiz so that
 * correct answers are varied across all option letters (never always 'A'),
 * while maintaining strict answer-key integrity and valid explanations.
 */
export function randomizeQuizQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  const letters: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];

  // Pre-generate a balanced, shuffled sequence of correct letters for this batch of questions
  // e.g. for 5 questions: [B, D, A, C, B] ensuring variety across choices
  let letterPool: ("A" | "B" | "C" | "D")[] = [];
  while (letterPool.length < questions.length) {
    const cycle = [...letters];
    for (let i = cycle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cycle[i], cycle[j]] = [cycle[j], cycle[i]];
    }
    letterPool = letterPool.concat(cycle);
  }

  return questions.map((q, idx) => {
    if (!q.choices || q.choices.length === 0) return q;

    // Find the text of the actual correct choice
    const correctChoiceObj = q.choices.find((c) => c.id === q.correctChoice);
    const correctText = correctChoiceObj ? correctChoiceObj.text : q.choices[0].text;

    // Separate distractor texts
    const distractorTexts = q.choices
      .filter((c) => c.text !== correctText)
      .map((c) => c.text);

    // Shuffle distractor texts
    for (let i = distractorTexts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distractorTexts[i], distractorTexts[j]] = [distractorTexts[j], distractorTexts[i]];
    }

    const assignedCorrectLetter = letterPool[idx] || letters[idx % letters.length];
    let distractorIdx = 0;

    const newChoices = letters.map((letter) => {
      if (letter === assignedCorrectLetter) {
        return { id: letter, text: correctText };
      } else {
        const text = distractorTexts[distractorIdx] || "Alternative option";
        distractorIdx++;
        return { id: letter, text };
      }
    });

    return {
      ...q,
      choices: newChoices,
      correctChoice: assignedCorrectLetter,
    };
  });
}

export type ReviewStatus = "GENERATED" | "UNDER_REVIEW" | "APPROVED" | "EDITED" | "REJECTED";

export interface ReviewableQuestion extends AssessmentQuestion {
  reviewStatus: ReviewStatus;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export function getInitialReviewQuestions(): ReviewableQuestion[] {
  const plfs = SAMPLE_QUESTIONS_DATABASE["doc_plfs_2024"] || [];
  const sna = SAMPLE_QUESTIONS_DATABASE["doc_sna_2008"] || [];
  const cpi = SAMPLE_QUESTIONS_DATABASE["doc_cpi_2024"] || [];
  const asi = SAMPLE_QUESTIONS_DATABASE["doc_asi_2024"] || [];

  const list: ReviewableQuestion[] = [];

  if (plfs[0]) {
    list.push({
      ...plfs[0],
      reviewStatus: "UNDER_REVIEW",
      reviewerNotes: "Generated by RAG from PLFS Operational Guidelines 2024. Awaiting institutional review.",
    });
  }
  if (plfs[1]) {
    list.push({
      ...plfs[1],
      reviewStatus: "APPROVED",
      reviewedAt: "2 hours ago (by Dr. Rajiv Sen)",
      reviewerNotes: "Verified against NSSO 2011 Census frame criteria. Approved for diagnostic testing.",
    });
  }
  if (sna[0]) {
    list.push({
      ...sna[0],
      reviewStatus: "UNDER_REVIEW",
      reviewerNotes: "Generated from System of National Accounts Chapter 2. Verify distinction between GVA and GDP.",
    });
  }
  if (sna[1]) {
    list.push({
      ...sna[1],
      reviewStatus: "EDITED",
      reviewedAt: "1 day ago (by Training Directorate)",
      reviewerNotes: "Distractor options refined to align with Indian national accounting terminology.",
    });
  }
  if (cpi[0]) {
    list.push({
      ...cpi[0],
      reviewStatus: "UNDER_REVIEW",
      reviewerNotes: "Generated from All India Consumer Price Index Manual. Check base year reference.",
    });
  }
  if (cpi[1]) {
    list.push({
      ...cpi[1],
      reviewStatus: "APPROVED",
      reviewedAt: "Yesterday (by Training Directorate)",
      reviewerNotes: "Clear citation and rigorous Laspeyres formulation. High confidence.",
    });
  }
  if (asi[0]) {
    list.push({
      ...asi[0],
      reviewStatus: "REJECTED",
      reviewedAt: "3 days ago",
      reviewerNotes: "Ambiguity in factory census cutoff definition under Factories Act 1948. Requires re-generation.",
    });
  }
  if (asi[1]) {
    list.push({
      ...asi[1],
      reviewStatus: "UNDER_REVIEW",
      reviewerNotes: "Generated from Annual Survey of Industries Manual. Ready for technical review.",
    });
  }

  return list;
}
