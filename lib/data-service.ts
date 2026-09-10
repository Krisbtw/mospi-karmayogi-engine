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
}

export interface CompetencyItem {
  id: string;
  fracCode: string;
  label: string;
  category: "DOMAIN" | "FUNCTIONAL" | "BEHAVIORAL";
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

// Initial officer proficiencies
export const INITIAL_OFFICER_COMPETENCIES: Record<string, CompetencyItem[]> = {
  user_jso_pune: [
    {
      id: "c1",
      fracCode: "FN-STAT-014",
      label: "Survey Sampling Design",
      category: "FUNCTIONAL",
      description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)",
      current: 3,
      target: 4,
      lastAssessed: "12 Aug 2026",
    },
    {
      id: "c2",
      fracCode: "DM-PRICE-002",
      label: "Price Statistics (CPI/WPI)",
      category: "DOMAIN",
      description: "Laspeyres/Jevons index compilation & rural/urban price aggregation",
      current: 2,
      target: 3,
      lastAssessed: "02 Jul 2026",
    },
    {
      id: "c3",
      fracCode: "FN-STAT-021",
      label: "National Income Accounting",
      category: "DOMAIN",
      description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations",
      current: 2,
      target: 3,
      lastAssessed: "28 May 2026",
    },
    {
      id: "c4",
      fracCode: "FN-STAT-033",
      label: "R/Python for Survey Processing",
      category: "FUNCTIONAL",
      description: "Automated unit-level data validation & microdata tabulation",
      current: 4,
      target: 4,
      lastAssessed: "19 Aug 2026",
    },
    {
      id: "c5",
      fracCode: "BH-INTEGRITY-001",
      label: "Data Integrity & Ethics",
      category: "BEHAVIORAL",
      description: "Official Statistics Confidentiality under Collection of Statistics Act 2008",
      current: 4,
      target: 5,
      lastAssessed: "05 Jun 2026",
    },
    {
      id: "c6",
      fracCode: "FN-STAT-042",
      label: "Industrial Production Indexing",
      category: "DOMAIN",
      description: "Annual Survey of Industries (ASI) and IIP item weight adjustment",
      current: 2,
      target: 3,
      lastAssessed: "14 Jul 2026",
    },
  ],
  user_so_delhi: [
    {
      id: "c1",
      fracCode: "FN-STAT-014",
      label: "Survey Sampling Design",
      category: "FUNCTIONAL",
      description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)",
      current: 4,
      target: 5,
      lastAssessed: "15 Aug 2026",
    },
    {
      id: "c2",
      fracCode: "DM-PRICE-002",
      label: "Price Statistics (CPI/WPI)",
      category: "DOMAIN",
      description: "Laspeyres/Jevons index compilation & rural/urban price aggregation",
      current: 4,
      target: 4,
      lastAssessed: "10 Aug 2026",
    },
    {
      id: "c3",
      fracCode: "FN-STAT-021",
      label: "National Income Accounting",
      category: "DOMAIN",
      description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations",
      current: 3,
      target: 4,
      lastAssessed: "21 Jul 2026",
    },
    {
      id: "c4",
      fracCode: "FN-STAT-033",
      label: "R/Python for Survey Processing",
      category: "FUNCTIONAL",
      description: "Automated unit-level data validation & microdata tabulation",
      current: 3,
      target: 5,
      lastAssessed: "02 Aug 2026",
    },
    {
      id: "c5",
      fracCode: "BH-INTEGRITY-001",
      label: "Data Integrity & Ethics",
      category: "BEHAVIORAL",
      description: "Official Statistics Confidentiality under Collection of Statistics Act 2008",
      current: 5,
      target: 5,
      lastAssessed: "12 May 2026",
    },
    {
      id: "c6",
      fracCode: "FN-STAT-042",
      label: "Industrial Production Indexing",
      category: "DOMAIN",
      description: "Annual Survey of Industries (ASI) and IIP item weight adjustment",
      current: 4,
      target: 4,
      lastAssessed: "30 Jun 2026",
    },
  ],
  user_dd_kolkata: [
    {
      id: "c1",
      fracCode: "FN-STAT-014",
      label: "Survey Sampling Design",
      category: "FUNCTIONAL",
      description: "NSSO Stratified Multistage Sampling & Sample Allocation (FOD)",
      current: 5,
      target: 5,
      lastAssessed: "01 Aug 2026",
    },
    {
      id: "c2",
      fracCode: "DM-PRICE-002",
      label: "Price Statistics (CPI/WPI)",
      category: "DOMAIN",
      description: "Laspeyres/Jevons index compilation & rural/urban price aggregation",
      current: 4,
      target: 5,
      lastAssessed: "18 Jul 2026",
    },
    {
      id: "c3",
      fracCode: "FN-STAT-021",
      label: "National Income Accounting",
      category: "DOMAIN",
      description: "SNA 2008 Gross Value Added (GVA) & GDP deflator calculations",
      current: 5,
      target: 5,
      lastAssessed: "25 Aug 2026",
    },
    {
      id: "c4",
      fracCode: "FN-STAT-033",
      label: "R/Python for Survey Processing",
      category: "FUNCTIONAL",
      description: "Automated unit-level data validation & microdata tabulation",
      current: 4,
      target: 5,
      lastAssessed: "11 Aug 2026",
    },
    {
      id: "c5",
      fracCode: "BH-INTEGRITY-001",
      label: "Data Integrity & Ethics",
      category: "BEHAVIORAL",
      description: "Official Statistics Confidentiality under Collection of Statistics Act 2008",
      current: 5,
      target: 5,
      lastAssessed: "10 Jun 2026",
    },
    {
      id: "c6",
      fracCode: "FN-STAT-042",
      label: "Industrial Production Indexing",
      category: "DOMAIN",
      description: "Annual Survey of Industries (ASI) and IIP item weight adjustment",
      current: 4,
      target: 5,
      lastAssessed: "14 Jul 2026",
    },
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

// Curated Grounded MCQs linked to source documents
export const SAMPLE_QUESTIONS_DATABASE: Record<string, AssessmentQuestion[]> = {
  doc_plfs_2024: [
    {
      id: "q_plfs_1",
      stem: "In the Periodic Labour Force Survey (PLFS) urban rotation scheme, how many times is each sampled household revisited before retiring from the sample?",
      choices: [
        { id: "A", text: "Visited once in each quarter for a total of 4 visits" },
        { id: "B", text: "Visited twice with a 6-month interval" },
        { id: "C", text: "Visited 3 consecutive times with monthly frequency" },
        { id: "D", text: "Visited continuously for 8 successive quarters" },
      ],
      correctChoice: "A",
      rationale: "Under the rotational panel sampling scheme adopted for urban areas in PLFS, each selected First Stage Unit (FSU) is visited 4 times with a 25% rotation rate: each household is interviewed once every quarter for 4 consecutive quarters to estimate quarterly workforce transitions.",
      bloomLevel: "UNDERSTAND",
      difficulty: 3,
      competencyFracCode: "FN-STAT-014",
      competencyLabel: "Survey Sampling Design",
      sourceDocument: "Periodic Labour Force Survey (PLFS) — Operational Guidelines",
      sourceCitation: "Chapter 2: Sampling Scheme, Section 2.4 Urban Rotational Design",
      sourceSnippet: "In urban areas, a rotational panel sampling design is used. Each selected urban frame unit is surveyed for a duration of four consecutive quarters, yielding a panel structure where 75% of sample units match between adjacent quarters.",
    },
    {
      id: "q_plfs_2",
      stem: "According to PLFS criteria, which activity criterion defines a person as employed under the 'Current Weekly Status' (CWS) approach?",
      choices: [
        { id: "A", text: "Worked for at least 1 hour on any one day during the 7-day reference period" },
        { id: "B", text: "Worked for at least 4 hours each day for 4 days in the reference week" },
        { id: "C", text: "Worked for at least 15 days in the preceding 30 days" },
        { id: "D", text: "Earned minimum wages on at least 3 days in the reference week" },
      ],
      correctChoice: "A",
      rationale: "Current Weekly Status (CWS) determines labour force activity over a 7-day recall window. A person is considered employed if they performed economic work for at least one hour on any day during the reference week.",
      bloomLevel: "APPLY",
      difficulty: 4,
      competencyFracCode: "FN-STAT-014",
      competencyLabel: "Survey Sampling Design",
      sourceDocument: "Periodic Labour Force Survey (PLFS) — Operational Guidelines",
      sourceCitation: "Chapter 3: Concepts & Definitions, Section 3.12 Current Weekly Status",
      sourceSnippet: "Under Current Weekly Status (CWS), a person who engaged in any gainful work activity for 1 hour or more on at least one day during the preceding 7 days is categorized as working (or employed).",
    },
    {
      id: "q_plfs_3",
      stem: "In multi-stage stratified sampling used by MoSPI FOD, what serves as the First Stage Unit (FSU) in rural and urban sectors respectively?",
      choices: [
        { id: "A", text: "Rural: Gram Panchayat; Urban: Ward" },
        { id: "B", text: "Rural: Census Village; Urban: Urban Frame Survey (UFS) block" },
        { id: "C", text: "Rural: Block Development Office; Urban: Municipal Corporation" },
        { id: "D", text: "Rural: Revenue circle; Urban: Pincode sector" },
      ],
      correctChoice: "B",
      rationale: "In NSSO sample surveys, rural FSUs are 2011 Census villages (or sub-villages for large ones), whereas urban FSUs are specifically delineated Urban Frame Survey (UFS) blocks maintained by NSSO FOD.",
      bloomLevel: "REMEMBER",
      difficulty: 2,
      competencyFracCode: "FN-STAT-014",
      competencyLabel: "Survey Sampling Design",
      sourceDocument: "Periodic Labour Force Survey (PLFS) — Operational Guidelines",
      sourceCitation: "Chapter 2: Sampling Frame, Section 2.1 First Stage Units",
      sourceSnippet: "The 2011 Population Census list of villages serves as the sampling frame for rural areas. For urban areas, the latest Urban Frame Survey (UFS) blocks are utilized as First Stage Units (FSUs).",
    },
  ],
  doc_cpi_manual: [
    {
      id: "q_cpi_1",
      stem: "Which mathematical formula is implemented by MoSPI for compiling elementary aggregate price indices before grouping into subgroup indices?",
      choices: [
        { id: "A", text: "Laspeyres arithmetic mean formula with fixed weights" },
        { id: "B", text: "Jevons geometric mean index formula (unweighted)" },
        { id: "C", text: "Paasche weighted harmonic mean formula" },
        { id: "D", text: "Fisher's ideal geometric mean of Laspeyres and Paasche" },
      ],
      correctChoice: "B",
      rationale: "At the elementary aggregate stage where item expenditure weights are not available at shop/market level, the Jevons index (geometric mean of price relatives) is used because it satisfies the axiom of transitivity and handles substitution bias.",
      bloomLevel: "ANALYZE",
      difficulty: 4,
      competencyFracCode: "DM-PRICE-002",
      competencyLabel: "Price Statistics (CPI/WPI)",
      sourceDocument: "All-India Consumer Price Index Compilation Manual",
      sourceCitation: "Chapter 4: Computation Methodology, Section 4.2 Elementary Index Formula",
      sourceSnippet: "Elementary aggregate indices are computed using the Jevons formula: the unweighted geometric mean of price relatives of quoted markets across villages/towns within the district/state.",
    },
    {
      id: "q_cpi_2",
      stem: "When an item's price quote is temporarily unavailable during monthly field pricing, what is MoSPI's prescribed standard imputation method?",
      choices: [
        { id: "A", text: "Set the price to zero for that collection month" },
        { id: "B", text: "Carry forward the base year price verbatim" },
        { id: "C", text: "Impute price movement using the relative price change of similar varieties in the same subgroup" },
        { id: "D", text: "Exclude the entire product category from state CPI compilation" },
      ],
      correctChoice: "C",
      rationale: "International and MoSPI standards prohibit carrying forward old nominal prices or inserting zeroes. Imputation applies the average price change observed in matching item varieties within the same elementary aggregate.",
      bloomLevel: "APPLY",
      difficulty: 3,
      competencyFracCode: "DM-PRICE-002",
      competencyLabel: "Price Statistics (CPI/WPI)",
      sourceDocument: "All-India Consumer Price Index Compilation Manual",
      sourceCitation: "Chapter 5: Missing Prices & Quality Adjustment, Section 5.3",
      sourceSnippet: "If a specified variety is temporarily not traded, its price is imputed using the short-term percentage change of prices of other reporting outlets in the same stratum for that specific item.",
    },
    {
      id: "q_cpi_3",
      stem: "What weighting formula is utilized by MoSPI to aggregate item-level elementary price indices to the state and all-India CPI indices?",
      choices: [
        { id: "A", text: "Modified Laspeyres price index formula with fixed consumer expenditure survey basket weights" },
        { id: "B", text: "Unweighted simple arithmetic average of quoted town prices" },
        { id: "C", text: "Paasche current-period expenditure weighting formula" },
        { id: "D", text: "Tornqvist superlative multilateral translog index" },
      ],
      correctChoice: "A",
      rationale: "MoSPI's All-India CPI compiles higher-level aggregations (subgroups, groups, and general index) using the modified Laspeyres formula with base-year item weighting diagrams derived from the Household Consumer Expenditure Survey.",
      bloomLevel: "UNDERSTAND",
      difficulty: 3,
      competencyFracCode: "DM-PRICE-002",
      competencyLabel: "Price Statistics (CPI/WPI)",
      sourceDocument: "All-India Consumer Price Index Compilation Manual",
      sourceCitation: "Chapter 6: Aggregation & Weighting, Section 6.1 Laspeyres Aggregation",
      sourceSnippet: "Subgroup and group indices are aggregated up to the all-India level using fixed base-period consumer expenditure weights derived from the Consumer Expenditure Survey (CES) via modified Laspeyres formula.",
    },
    {
      id: "q_cpi_4",
      stem: "In the compilation of CPI (Urban), how does MoSPI collect and track changes in the House Rent Index?",
      choices: [
        { id: "A", text: "Repeat visits every 6 months to a fixed panel of rented dwellings using a chain-base method" },
        { id: "B", text: "Monthly internet rental listing scraping without on-site verification" },
        { id: "C", text: "Annual municipal tax assessment records without field sampling" },
        { id: "D", text: "One-time decennial census rent valuation" },
      ],
      correctChoice: "A",
      rationale: "The House Rent Survey under CPI (Urban) uses a panel of rented dwellings visited once every six months. A chain-base method links six-month relative rent changes into the monthly index.",
      bloomLevel: "APPLY",
      difficulty: 4,
      competencyFracCode: "DM-PRICE-002",
      competencyLabel: "Price Statistics (CPI/WPI)",
      sourceDocument: "All-India Consumer Price Index Compilation Manual",
      sourceCitation: "Chapter 7: House Rent Survey, Section 7.4 Panel Rotation",
      sourceSnippet: "Urban house rent is surveyed through a fixed panel of dwelling units surveyed semi-annually. The chain-base relative method links successive 6-month cycles to estimate monthly rental inflation.",
    },
  ],
  doc_nas_sna: [
    {
      id: "q_nas_1",
      stem: "Under System of National Accounts (SNA 2008), how is Gross Value Added (GVA) at basic prices computed from output and intermediate consumption?",
      choices: [
        { id: "A", text: "GVA at basic prices = Gross Output at basic prices - Intermediate Consumption" },
        { id: "B", text: "GVA at basic prices = GDP at market prices + Subsidies on production" },
        { id: "C", text: "GVA at basic prices = Net Domestic Product + Operating Surplus" },
        { id: "D", text: "GVA at basic prices = Gross Output + Taxes on products - Intermediate Consumption" },
      ],
      correctChoice: "A",
      rationale: "By SNA 2008 definition, GVA at basic prices equals total gross output valued at basic prices minus intermediate consumption at purchasers' prices, excluding taxes on products.",
      bloomLevel: "UNDERSTAND",
      difficulty: 3,
      competencyFracCode: "FN-STAT-021",
      competencyLabel: "National Income Accounting",
      sourceDocument: "National Accounts Statistics — Sources and Methods",
      sourceCitation: "Chapter 1: Conceptual Framework, Section 1.5 Gross Value Added",
      sourceSnippet: "Gross Value Added (GVA) at basic prices measures the value created by any unit engaged in production activity. It is defined as gross output (at basic prices) less intermediate consumption (at purchasers' prices).",
    },
    {
      id: "q_nas_2",
      stem: "In the System of National Accounts (SNA 2008), how is Gross Domestic Product (GDP) at market prices derived from Gross Value Added (GVA) at basic prices?",
      choices: [
        { id: "A", text: "GDP at market prices = GVA at basic prices + Product Taxes - Product Subsidies" },
        { id: "B", text: "GDP at market prices = GVA at basic prices - Production Taxes + Production Subsidies" },
        { id: "C", text: "GDP at market prices = GVA at basic prices + Net Factor Income from Abroad" },
        { id: "D", text: "GDP at market prices = GVA at basic prices - Consumption of Fixed Capital" },
      ],
      correctChoice: "A",
      rationale: "Under SNA 2008 adopted in India's 2011-12 series, headline GDP at market prices is compiled as GVA at basic prices plus net product taxes (product taxes minus product subsidies).",
      bloomLevel: "APPLY",
      difficulty: 3,
      competencyFracCode: "FN-STAT-021",
      competencyLabel: "National Income Accounting",
      sourceDocument: "National Accounts Statistics — Sources and Methods",
      sourceCitation: "Chapter 1: Conceptual Framework, Section 1.7 Transition from GVA to GDP",
      sourceSnippet: "GDP at market prices is obtained by adding product taxes and subtracting product subsidies from the aggregate of Gross Value Added (GVA) of all resident production units at basic prices.",
    },
    {
      id: "q_nas_3",
      stem: "Under SNA 2008 principles, what is the prescribed statistical treatment of Financial Intermediation Services Indirectly Measured (FISIM)?",
      choices: [
        { id: "A", text: "Treated as a lump-sum deduction from economy-wide GDP without sector allocation" },
        { id: "B", text: "Computed as the difference between reference rate and effective rates on loans and deposits, and allocated to consuming sectors" },
        { id: "C", text: "Recorded entirely as final household consumption expenditure" },
        { id: "D", text: "Classified strictly as transfer payments and omitted from national accounts" },
      ],
      correctChoice: "B",
      rationale: "SNA 2008 requires FISIM to be calculated on both loans and deposits using an interbank reference interest rate, and subsequently distributed between intermediate consumption of industries and final consumption of households and government.",
      bloomLevel: "ANALYZE",
      difficulty: 4,
      competencyFracCode: "FN-STAT-021",
      competencyLabel: "National Income Accounting",
      sourceDocument: "National Accounts Statistics — Sources and Methods",
      sourceCitation: "Chapter 3: Institutional Sectors, Section 3.2 Financial Intermediation (FISIM)",
      sourceSnippet: "FISIM is calculated using reference rate: FISIM = (r_loan - r_ref) * Loans + (r_ref - r_dep) * Deposits. The total is allocated across consuming institutional sectors.",
    },
    {
      id: "q_nas_4",
      stem: "Which asset category is explicitly included in Gross Fixed Capital Formation (GFCF) under the 2011-12 National Accounts series following SNA 2008?",
      choices: [
        { id: "A", text: "Expenditure on research and development (R&D) and intellectual property products" },
        { id: "B", text: "Short-term consumer durable goods purchases by households" },
        { id: "C", text: "Speculative transactions in corporate equities and mutual funds" },
        { id: "D", text: "Uncompensated natural disaster asset losses" },
      ],
      correctChoice: "A",
      rationale: "In accordance with SNA 2008, expenditures on research and development (R&D), database creation, and mineral exploration are capitalized as intellectual property products and included in Gross Fixed Capital Formation (GFCF).",
      bloomLevel: "UNDERSTAND",
      difficulty: 3,
      competencyFracCode: "FN-STAT-021",
      competencyLabel: "National Income Accounting",
      sourceDocument: "National Accounts Statistics — Sources and Methods",
      sourceCitation: "Chapter 4: Capital Formation, Section 4.3 Intellectual Property Assets",
      sourceSnippet: "Gross Fixed Capital Formation (GFCF) comprises acquisitions less disposals of produced assets used in production for more than one year, including intellectual property products such as R&D.",
    },
  ],
  doc_asi_manual: [
    {
      id: "q_asi_1",
      stem: "In the Annual Survey of Industries (ASI), which criterion separates factories into the 'Census Sector' from the 'Sample Sector'?",
      choices: [
        { id: "A", text: "Factories with 100 or more workers are completely enumerated in the Census Sector" },
        { id: "B", text: "Factories operating for less than 3 years are classified into the Census Sector" },
        { id: "C", text: "Only publicly listed PSU factories belong to the Census Sector" },
        { id: "D", text: "Factories with annual turnover under 50 lakh rupees form the Census Sector" },
      ],
      correctChoice: "A",
      rationale: "In ASI sampling design, the Census Sector comprises all industrial units employing 100 or more workers (or 50+ in certain smaller states/UTs) which are surveyed 100% annually without sampling.",
      bloomLevel: "REMEMBER",
      difficulty: 2,
      competencyFracCode: "FN-STAT-042",
      competencyLabel: "Industrial Production Indexing",
      sourceDocument: "Annual Survey of Industries — Volume 1 Methodology",
      sourceCitation: "Chapter 2: Sampling Frame & Stratification, Section 2.2",
      sourceSnippet: "The ASI frame consists of the Census Sector and Sample Sector. The Census Sector covers all factories employing 100 or more workers across the 6 major industrial states, as well as all factories in less-industrialized states.",
    },
    {
      id: "q_asi_2",
      stem: "In the Annual Survey of Industries (ASI), how is Net Value Added (NVA) derived from Gross Value Added (GVA)?",
      choices: [
        { id: "A", text: "Net Value Added (NVA) = Gross Value Added (GVA) - Depreciation (Consumption of Fixed Capital)" },
        { id: "B", text: "Net Value Added (NVA) = Gross Value Added (GVA) + Subsidies on production" },
        { id: "C", text: "Net Value Added (NVA) = Gross Output - Fuel and Lubricant costs only" },
        { id: "D", text: "Net Value Added (NVA) = Ex-factory value of output + Rent paid" },
      ],
      correctChoice: "A",
      rationale: "In ASI industrial accounts, Net Value Added (NVA) is obtained by deducting depreciation (consumption of fixed capital during the accounting year) from Gross Value Added (GVA).",
      bloomLevel: "UNDERSTAND",
      difficulty: 2,
      competencyFracCode: "FN-STAT-042",
      competencyLabel: "Industrial Production Indexing",
      sourceDocument: "Annual Survey of Industries — Volume 1 Methodology",
      sourceCitation: "Chapter 3: Economic Concepts & Accounting Framework, Section 3.8",
      sourceSnippet: "Net Value Added (NVA) represents total value generated by manufacturing activity net of depreciation: NVA = GVA - Depreciation of fixed capital assets.",
    },
    {
      id: "q_asi_3",
      stem: "In India's Index of Industrial Production (IIP, base 2011-12), which broad sector commands the largest weighting?",
      choices: [
        { id: "A", text: "Manufacturing sector with 77.63% weight" },
        { id: "B", text: "Mining sector with 55.40% weight" },
        { id: "C", text: "Electricity generation with 45.10% weight" },
        { id: "D", text: "Heavy chemicals and fertilisers with 62.00% weight" },
      ],
      correctChoice: "A",
      rationale: "In the IIP 2011-12 series, the sectoral weights are: Manufacturing 77.633%, Mining 14.373%, and Electricity 7.994%.",
      bloomLevel: "REMEMBER",
      difficulty: 2,
      competencyFracCode: "FN-STAT-042",
      competencyLabel: "Industrial Production Indexing",
      sourceDocument: "Annual Survey of Industries & Index of Industrial Production Guidelines",
      sourceCitation: "Chapter 1: IIP Weighting Structure, Section 1.3",
      sourceSnippet: "The weighting diagram of the 2011-12 base IIP allocates 77.63% to manufacturing (405 item groups), 14.37% to mining (1 item), and 7.99% to electricity.",
    },
    {
      id: "q_asi_4",
      stem: "What constitutes the 'Ex-Factory Value of Output' in the Annual Survey of Industries (ASI) accounting framework?",
      choices: [
        { id: "A", text: "Value of products produced during the year net of product taxes (GST/excise), trade discounts, and outward freight" },
        { id: "B", text: "Gross retail market price including dealer margins and state sales taxes" },
        { id: "C", text: "Total purchase cost of raw materials and electricity consumed" },
        { id: "D", text: "Book value of physical machinery plus inventory stock at year end" },
      ],
      correctChoice: "A",
      rationale: "Ex-factory value represents the net value received by the factory at the factory gate, deducting taxes on products (like GST/excise), transport charges paid to external carriers, and rebates/discounts from gross sales value.",
      bloomLevel: "APPLY",
      difficulty: 3,
      competencyFracCode: "FN-STAT-042",
      competencyLabel: "Industrial Production Indexing",
      sourceDocument: "Annual Survey of Industries — Volume 1 Methodology",
      sourceCitation: "Chapter 3: Accounting Concepts, Section 3.4 Ex-Factory Value",
      sourceSnippet: "Ex-factory value of output is evaluated at sales value excluding rebate, trade discount, excise duties, GST and outward transport freight charges.",
    },
  ],
  doc_data_processing: [
    {
      id: "q_code_1",
      stem: "When processing NSSO unit-level microdata in R or Python, what formula applies the sampling design weight (multiplier) to compute estimated population totals from sample observations?",
      choices: [
        { id: "A", text: "Estimated Total = Sum of (sample value * multiplier / 100 for sub-sample combined)" },
        { id: "B", text: "Estimated Total = Simple arithmetic mean of sample values without weighting" },
        { id: "C", text: "Estimated Total = Sample value divided by total number of villages surveyed" },
        { id: "D", text: "Estimated Total = Geometric mean of stratum multipliers" },
      ],
      correctChoice: "A",
      rationale: "In NSS unit-level datasets, the multiplier field gives the weight. For sub-sample combined estimates, the standard formula is sum(value * multiplier / 100) as documented in NSSO data layout specifications.",
      bloomLevel: "APPLY",
      difficulty: 4,
      competencyFracCode: "FN-STAT-033",
      competencyLabel: "R/Python for Survey Processing",
      sourceDocument: "NSSO Microdata Processing Standards & Tabulation Guidelines",
      sourceCitation: "Chapter 4: Estimation Procedures, Section 4.2 Multiplier Weighting",
      sourceSnippet: "To generate unbiased population aggregates, each record value is multiplied by the design weight (weight = Multiplier / 100 for combined sub-sample tabulations).",
    },
    {
      id: "q_code_2",
      stem: "In automated statistical data cleaning pipelines, which diagnostic rule is standard for detecting multivariate outliers in industrial survey returns?",
      choices: [
        { id: "A", text: "Mahalanobis distance calculation taking into account feature covariance matrix" },
        { id: "B", text: "Deleting all values exceeding the median by 5%" },
        { id: "C", text: "Sorting rows alphabetically by factory name" },
        { id: "D", text: "Replacing missing survey values with constant zero" },
      ],
      correctChoice: "A",
      rationale: "Mahalanobis distance evaluates an observation's distance from the multi-dimensional distribution mean while accounting for correlations between financial and production metrics.",
      bloomLevel: "ANALYZE",
      difficulty: 4,
      competencyFracCode: "FN-STAT-033",
      competencyLabel: "R/Python for Survey Processing",
      sourceDocument: "Data Quality Assurance Division (DQAD) Automated Validation Manual",
      sourceCitation: "Section 3: Outlier Detection and Imputation Rules",
      sourceSnippet: "Multivariate outlier screening uses Mahalanobis distance D^2 = (x - mu)^T Sigma^-1 (x - mu) evaluated against Chi-square thresholds.",
    },
  ],
  doc_data_ethics: [
    {
      id: "q_ethics_1",
      stem: "Under Section 9 of the Collection of Statistics Act 2008, what is the statutory restriction on disclosing individual informant data?",
      choices: [
        { id: "A", text: "No individual return or identity may be published or disclosed without previous consent in writing of the informant" },
        { id: "B", text: "Informant identities may be shared openly on public portals for transparency" },
        { id: "C", text: "Enterprise financial statements may be traded with commercial marketing agencies" },
        { id: "D", text: "Individual records are exempt from confidentiality once 30 days have elapsed" },
      ],
      correctChoice: "A",
      rationale: "Section 9 strictly mandates informant confidentiality: no individual return, answer, or identified information can be published or disclosed as evidence without prior written consent.",
      bloomLevel: "REMEMBER",
      difficulty: 3,
      competencyFracCode: "BH-INTEGRITY-001",
      competencyLabel: "Data Integrity & Ethics",
      sourceDocument: "Collection of Statistics Act 2008 & Statutory Rules",
      sourceCitation: "Section 9: Restriction on disclosure of information",
      sourceSnippet: "No information contained in any individual return and no answer to any question shall be published in a manner which enables individual identification, except with the prior written consent of the person or informant.",
    },
  ],
};

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

// Global in-memory registry for runtime documents & chunks
const GLOBAL_DOCUMENTS = new Map<string, DocumentItem>(
  PRELOADED_DOCUMENTS.map((doc) => [doc.id, doc])
);

const GLOBAL_CHUNKS = new Map<string, StoredChunk[]>([
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
        headingPath: ["Chapter 1: Conceptual Framework", "1.5 Gross Value Added"],
        content:
          "Gross Value Added (GVA) at basic prices measures the value created by any unit engaged in production activity. It is defined as gross output (at basic prices) less intermediate consumption (at purchasers' prices).",
      },
      {
        id: "chunk_nas_2",
        documentId: "doc_nas_sna",
        ordinal: 2,
        headingPath: ["Chapter 3: Institutional Sectors", "3.2 Financial Intermediation (FISIM)"],
        content:
          "Financial Intermediation Services Indirectly Measured (FISIM) is computed on loans and deposits by financial institutions using reference rates and allocated across consuming sectors.",
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
    title.includes("gva")
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
 * Competency-first question resolver:
 * Ensures questions match the requested competency rather than defaulting to PLFS
 */
export function resolveQuestionsForQuiz(params: {
  documentId?: string;
  competencyFracCode?: string;
  questionCount?: number;
  difficulty?: number;
  bloomLevel?: string;
}): AssessmentQuestion[] {
  const { documentId, competencyFracCode, questionCount = 3, difficulty, bloomLevel } = params;
  const allQuestions = Object.values(SAMPLE_QUESTIONS_DATABASE).flat();

  let matchedQuestions: AssessmentQuestion[] = [];

  // 1. If competency is specified, prioritize matching that competency
  if (competencyFracCode) {
    if (documentId && SAMPLE_QUESTIONS_DATABASE[documentId]) {
      const docMatching = SAMPLE_QUESTIONS_DATABASE[documentId].filter(
        (q) => q.competencyFracCode === competencyFracCode
      );
      if (docMatching.length >= questionCount) {
        matchedQuestions = [...docMatching];
      }
    }

    if (matchedQuestions.length === 0) {
      const competencyMatching = allQuestions.filter(
        (q) => q.competencyFracCode === competencyFracCode
      );
      if (competencyMatching.length > 0) {
        matchedQuestions = [...competencyMatching];
      }
    }
  }

  // 2. If documentId is provided, check its specific questions or mapped topic
  if (matchedQuestions.length === 0 && documentId) {
    if (SAMPLE_QUESTIONS_DATABASE[documentId]?.length > 0) {
      matchedQuestions = [...SAMPLE_QUESTIONS_DATABASE[documentId]];
    } else {
      const doc = getStoredDocument(documentId) || PRELOADED_DOCUMENTS.find((d) => d.id === documentId);
      if (doc) {
        const mappedFrac = getCompetencyForDocument(doc);
        const mapped = allQuestions.filter((q) => q.competencyFracCode === mappedFrac);
        if (mapped.length > 0) {
          matchedQuestions = [...mapped];
        }
      }
    }
  }

  if (matchedQuestions.length === 0) {
    matchedQuestions = [...allQuestions];
  }

  // Apply requested difficulty and bloomLevel, and update sourceDocument if documentId is provided
  const doc = documentId
    ? getStoredDocument(documentId) || PRELOADED_DOCUMENTS.find((d) => d.id === documentId)
    : null;

  return matchedQuestions.slice(0, questionCount).map((q) => ({
    ...q,
    difficulty: difficulty !== undefined ? difficulty : q.difficulty,
    bloomLevel: bloomLevel ? (bloomLevel.toUpperCase() as any) : q.bloomLevel,
    sourceDocument: doc && doc.title ? doc.title : q.sourceDocument,
  }));
}


