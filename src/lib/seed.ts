import { chunkSections } from './chunk';
import { embedMany } from './embed';
import { parseTxtSections } from './extract';
import { roleMap } from './competency-data';
import type { DB, Chunk, DocRecord } from './types';

const DOC1 = `# Introduction to Sampling
The National Sample Survey relies on scientifically designed sampling frames to produce representative estimates.
A sampling frame is the complete list of sampling units from which the sample is drawn.
Stratification divides the population into homogeneous groups called strata before selection.
Probability proportional to size sampling assigns higher selection probability to larger units.
Systematic sampling selects every kth unit from the list after a random start.
Cluster sampling surveys entire groups of nearby households to reduce field travel cost.
Multistage sampling combines selection of villages first and households second.
Sample size depends on the precision target and the population variance.
Weighting adjustments correct for unequal selection probabilities and non-response.
The design effect measures the loss of efficiency due to clustering compared to simple random sampling.
Non-sampling errors arise from coverage mistakes, respondent errors and processing mistakes.
Pilot testing of the questionnaire detects ambiguous wording before the main survey round.
Reference period recall errors are reduced by using a fixed thirty day window.
# Field Operations
Field investigators must verify the enumeration area boundaries before listing households.
Supervisors spot check ten percent of completed schedules for quality control.
Spot checks re-interview a small subset of households to detect fabrication of responses.
Replacement households are selected only after three genuine contact attempts fail.
The response rate is the ratio of completed interviews to eligible households contacted.
# Data Processing
Data editing rules flag out-of-range values and skip pattern violations.
Imputation fills missing values using nearest neighbour donor methods.
Outliers are reviewed against source documents before any correction is applied.
The validation plan documents every check applied to each variable.`;

const DOC2 = `# Validation Concepts
Data validation confirms that each recorded value conforms to its expected format and range.
Range checks confirm numeric values fall between plausible minimum and maximum limits.
Consistency checks compare related fields such as age and date of birth.
Skip logic validation ensures unanswered questions follow the correct filter pattern.
Duplicate detection identifies records sharing identical identifiers across datasets.
Checksum verification confirms that transmitted files arrive without corruption.
The golden source principle states that one designated system holds the authoritative copy.
# Quality Management
A data quality dashboard tracks timeliness, completeness and accuracy indicators.
Root cause analysis traces recurring validation failures back to their source process.
Correction logs preserve the original value alongside every modified entry.
Reconciliation compares aggregated totals against independent administrative records.
A data steward is the named officer accountable for the quality of a dataset.
Escalation rules define when unresolved validation errors must be reported upward.`;

export async function buildSeed(): Promise<DB> {
  const documents: DocRecord[] = [];
  const chunks: Chunk[] = [];
  const seedDocs: [string, string, string, string][] = [
    ['D-SURVEY', 'Survey Sampling & Methodology Handbook', 'survey-methodology-handbook.txt', DOC1],
    ['D-VALID', 'Data Validation & Quality Standards Guide', 'data-validation-guide.txt', DOC2],
  ];
  for (const [id, title, filename, text] of seedDocs) {
    const sections = parseTxtSections(text);
    const raw = chunkSections(sections, id, title);
    const embs = await embedMany(raw.map(c => c.text));
    const full = raw.map((c, i) => ({ ...c, embedding: embs[i] }));
    documents.push({ id, title, filename, kind: 'txt', sections, uploadedAt: '2025-01-15T09:00:00.000Z', chunkCount: full.length });
    chunks.push(...full);
  }

  const employees: DB['employees'] = [
    { id: 'E001', name: 'Ananya Sharma', department: 'Ministry of Statistics & Programme Implementation', designation: 'Data Analyst', role: 'R-SDA', yearsExperience: 6, location: 'New Delhi', functionalArea: 'Survey Operations', cadreRank: 'Group B' },
    { id: 'E002', name: 'Rajesh Kumar', department: 'Ministry of Statistics & Programme Implementation', designation: 'Statistical Investigator', role: 'R-SDA', yearsExperience: 11, location: 'Lucknow', functionalArea: 'Field Operations', cadreRank: 'Group B' },
    { id: 'E003', name: 'Meera Nair', department: 'Ministry of Statistics & Programme Implementation', designation: 'Senior Statistical Officer', role: 'R-SO', yearsExperience: 14, location: 'Kolkata', functionalArea: 'NSS Operations', cadreRank: 'Group A' },
    { id: 'E004', name: 'David Fernandes', department: 'Ministry of Statistics & Programme Implementation', designation: 'IT Systems Officer', role: 'R-ITO', yearsExperience: 8, location: 'Mumbai', functionalArea: 'Data Systems', cadreRank: 'Group B' },
    { id: 'E005', name: 'Kavita Reddy', department: 'Ministry of Health & Family Welfare', designation: 'M&E Officer', role: 'R-PA', yearsExperience: 9, location: 'Hyderabad', functionalArea: 'Monitoring & Evaluation', cadreRank: 'Group B' },
    { id: 'E006', name: 'Arjun Mehta', department: 'NITI Aayog', designation: 'Research Officer', role: 'R-DS', yearsExperience: 4, location: 'New Delhi', functionalArea: 'Data & Analytics', cadreRank: 'Group B' },
  ];

  const courses: DB['courses'] = [
    { employeeId: 'E001', title: 'Official Statistics in India', provider: 'iGOT Karmayogi', competencyId: 'C-OSTA', completedOn: '2024-03-10', score: 88, certificate: true, hours: 8, source: 'history' },
    { employeeId: 'E001', title: 'Data Storytelling with Charts', provider: 'iGOT Karmayogi', competencyId: 'C-VIZ', completedOn: '2024-08-02', score: 76, certificate: true, hours: 4, source: 'history' },
    { employeeId: 'E002', title: 'Survey Methodology Essentials', provider: 'iGOT Karmayogi', competencyId: 'C-SMET', completedOn: '2023-06-15', score: 71, certificate: true, hours: 8, source: 'history' },
    { employeeId: 'E003', title: 'Foundations of Sample Surveys', provider: 'iGOT Karmayogi', competencyId: 'C-SAMP', completedOn: '2022-09-01', score: 91, certificate: true, hours: 6, source: 'history' },
    { employeeId: 'E003', title: 'Project Management for Survey Operations', provider: 'iGOT Karmayogi', competencyId: 'C-PROJ', completedOn: '2024-05-20', score: 68, certificate: false, hours: 10, source: 'history' },
    { employeeId: 'E004', title: 'Python for Data Analysis', provider: 'iGOT Karmayogi', competencyId: 'C-PROG', completedOn: '2024-10-11', score: 79, certificate: true, hours: 12, source: 'history' },
    { employeeId: 'E006', title: 'R Programming for Government Statistics', provider: 'iGOT Karmayogi', competencyId: 'C-PROG', completedOn: '2023-11-02', score: 83, certificate: true, hours: 10, source: 'history' },
    { employeeId: 'E006', title: 'Data Cleaning & Validation Basics', provider: 'iGOT Karmayogi', competencyId: 'C-DVAL', completedOn: '2024-07-19', score: 77, certificate: true, hours: 5, source: 'history' },
  ];

  const competencies: DB['competencies'] = [];
  const events: DB['events'] = [];
  const assessments: DB['assessments'] = [];

  const seeded: [string, Record<string, number>, string][] = [
    ['E002', { 'C-SAMP': 58, 'C-SMET': 64, 'C-DVAL': 55, 'C-STAT': 48, 'C-VIZ': 72, 'C-PROG': 41 }, '2024-11-12T10:00:00.000Z'],
    ['E003', { 'C-SAMP': 78, 'C-SMET': 82, 'C-STAT': 74, 'C-DQUL': 69, 'C-OSTA': 84, 'C-PROJ': 66 }, '2025-01-20T10:00:00.000Z'],
    ['E004', { 'C-DVAL': 62, 'C-DQUL': 58, 'C-PROG': 70, 'C-PROJ': 55, 'C-ML': 44, 'C-COMM': 60 }, '2025-02-05T10:00:00.000Z'],
    ['E006', { 'C-STAT': 66, 'C-PROG': 74, 'C-ML': 52, 'C-VIZ': 70, 'C-DVAL': 61, 'C-GIS': 38 }, '2025-03-01T10:00:00.000Z'],
  ];
  for (const [empId, scores, date] of seeded) {
    const emp = employees.find(e => e.id === empId)!;
    const role = roleMap.get(emp.role)!;
    for (const [cid, val] of Object.entries(scores)) {
      competencies.push({ employeeId: empId, competencyId: cid, current: val, updatedAt: date });
      events.push({ id: `EV-${empId}-${cid}`, employeeId: empId, competencyId: cid, type: 'diagnostic', after: val, detail: `Diagnostic assessment — ${role.title}`, createdAt: date });
    }
    const overall = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length);
    assessments.push({ id: `ASM-${empId}`, employeeId: empId, role: emp.role, status: 'completed', createdAt: date, completedAt: date, questions: [], answers: {}, overall });
  }
  events.push({ id: 'EV-E002-quiz', employeeId: 'E002', competencyId: 'C-PROG', type: 'ai-quiz', before: 35, after: 41, detail: 'AI quiz “Survey Sampling & Methodology Handbook — practice” — 7/10 correct (70%)', createdAt: '2025-02-18T14:30:00.000Z' });

  const enrollments: DB['enrollments'] = [
    { employeeId: 'E002', courseId: 'IG-12', status: 'enrolled', enrolledAt: '2025-03-10T09:00:00.000Z' },
    { employeeId: 'E006', courseId: 'IG-16', status: 'enrolled', enrolledAt: '2025-03-12T11:00:00.000Z' },
  ];

  return {
    employees, courses, competencies, assessments, quizzes: [], attempts: [],
    documents, chunks, events, enrollments,
  };
}
