import type { CatalogCourse } from './types';

export interface CompetencyDef { id: string; name: string; domain: string; }
export const COMPETENCIES: CompetencyDef[] = [
  { id: 'C-SAMP', name: 'Sampling Techniques', domain: 'Survey Methods' },
  { id: 'C-SMET', name: 'Survey Methodology', domain: 'Survey Methods' },
  { id: 'C-DVAL', name: 'Data Validation', domain: 'Data Management' },
  { id: 'C-STAT', name: 'Statistical Analysis', domain: 'Analytics' },
  { id: 'C-VIZ', name: 'Data Visualization', domain: 'Analytics' },
  { id: 'C-PROG', name: 'Statistical Programming', domain: 'Analytics' },
  { id: 'C-DQUL', name: 'Data Quality Management', domain: 'Data Management' },
  { id: 'C-PROJ', name: 'Project Management', domain: 'Management' },
  { id: 'C-GIS', name: 'GIS & Spatial Analysis', domain: 'Analytics' },
  { id: 'C-ML', name: 'Machine Learning Fundamentals', domain: 'Analytics' },
  { id: 'C-COMM', name: 'Communication & Reporting', domain: 'Management' },
  { id: 'C-OSTA', name: 'Official Statistics', domain: 'Survey Methods' },
];
export const competencyMap = new Map(COMPETENCIES.map(c => [c.id, c]));

export interface RoleDef { id: string; title: string; competencies: { id: string; required: number }[]; }
export const ROLES: RoleDef[] = [
  { id: 'R-SDA', title: 'Survey Data Analyst', competencies: [
    { id: 'C-SAMP', required: 85 }, { id: 'C-SMET', required: 80 }, { id: 'C-DVAL', required: 80 },
    { id: 'C-STAT', required: 85 }, { id: 'C-VIZ', required: 75 }, { id: 'C-PROG', required: 80 }] },
  { id: 'R-SO', title: 'Statistical Officer', competencies: [
    { id: 'C-SAMP', required: 80 }, { id: 'C-SMET', required: 85 }, { id: 'C-STAT', required: 85 },
    { id: 'C-DQUL', required: 80 }, { id: 'C-OSTA', required: 85 }, { id: 'C-PROJ', required: 70 }] },
  { id: 'R-DS', title: 'Data Scientist', competencies: [
    { id: 'C-STAT', required: 90 }, { id: 'C-PROG', required: 90 }, { id: 'C-ML', required: 85 },
    { id: 'C-VIZ', required: 80 }, { id: 'C-DVAL', required: 75 }, { id: 'C-GIS', required: 70 }] },
  { id: 'R-FSC', title: 'Field Survey Coordinator', competencies: [
    { id: 'C-SMET', required: 85 }, { id: 'C-SAMP', required: 75 }, { id: 'C-PROJ', required: 80 },
    { id: 'C-COMM', required: 80 }, { id: 'C-DQUL', required: 70 }, { id: 'C-OSTA', required: 70 }] },
  { id: 'R-ITO', title: 'IT Systems Officer', competencies: [
    { id: 'C-DVAL', required: 80 }, { id: 'C-DQUL', required: 85 }, { id: 'C-PROG', required: 75 },
    { id: 'C-PROJ', required: 75 }, { id: 'C-ML', required: 65 }, { id: 'C-COMM', required: 65 }] },
  { id: 'R-PA', title: 'Policy Analyst', competencies: [
    { id: 'C-OSTA', required: 85 }, { id: 'C-STAT', required: 75 }, { id: 'C-COMM', required: 85 },
    { id: 'C-VIZ', required: 75 }, { id: 'C-PROJ', required: 70 }, { id: 'C-ML', required: 60 }] },
];
export const roleMap = new Map(ROLES.map(r => [r.id, r]));

export interface DepartmentDef { name: string; designations: { title: string; roles: string[] }[]; }
export const DEPARTMENTS: DepartmentDef[] = [
  { name: 'Ministry of Statistics & Programme Implementation', designations: [
    { title: 'Statistical Investigator', roles: ['R-SDA', 'R-FSC'] },
    { title: 'Data Analyst', roles: ['R-SDA', 'R-DS'] },
    { title: 'Senior Statistical Officer', roles: ['R-SO', 'R-PA'] },
    { title: 'IT Systems Officer', roles: ['R-ITO'] }] },
  { name: 'Ministry of Health & Family Welfare', designations: [
    { title: 'Programme Officer', roles: ['R-PA', 'R-FSC'] },
    { title: 'M&E Officer', roles: ['R-SDA', 'R-PA'] }] },
  { name: 'NITI Aayog', designations: [
    { title: 'Research Officer', roles: ['R-PA', 'R-DS'] },
    { title: 'Senior Consultant', roles: ['R-DS', 'R-SO'] }] },
];

export const IGOT_CATALOG: CatalogCourse[] = [
  { id: 'IG-01', title: 'Foundations of Sample Surveys', competencyId: 'C-SAMP', level: 'Foundation', difficulty: 'Easy', hours: 6, provider: 'iGOT Karmayogi' },
  { id: 'IG-02', title: 'Sampling Design & Estimation Methods', competencyId: 'C-SAMP', level: 'Intermediate', difficulty: 'Medium', hours: 10, provider: 'iGOT Karmayogi' },
  { id: 'IG-03', title: 'Survey Methodology Essentials', competencyId: 'C-SMET', level: 'Foundation', difficulty: 'Easy', hours: 8, provider: 'iGOT Karmayogi' },
  { id: 'IG-04', title: 'Designing Household Surveys', competencyId: 'C-SMET', level: 'Intermediate', difficulty: 'Medium', hours: 12, provider: 'iGOT Karmayogi' },
  { id: 'IG-05', title: 'Data Cleaning & Validation Basics', competencyId: 'C-DVAL', level: 'Foundation', difficulty: 'Easy', hours: 5, provider: 'iGOT Karmayogi' },
  { id: 'IG-06', title: 'Advanced Data Validation Techniques', competencyId: 'C-DVAL', level: 'Intermediate', difficulty: 'Medium', hours: 8, provider: 'iGOT Karmayogi' },
  { id: 'IG-07', title: 'Statistical Inference for Survey Data', competencyId: 'C-STAT', level: 'Intermediate', difficulty: 'Medium', hours: 14, provider: 'iGOT Karmayogi' },
  { id: 'IG-08', title: 'Applied Regression Analysis', competencyId: 'C-STAT', level: 'Advanced', difficulty: 'Hard', hours: 16, provider: 'iGOT Karmayogi' },
  { id: 'IG-09', title: 'Data Storytelling with Charts', competencyId: 'C-VIZ', level: 'Foundation', difficulty: 'Easy', hours: 4, provider: 'iGOT Karmayogi' },
  { id: 'IG-10', title: 'Advanced Visualization for Official Data', competencyId: 'C-VIZ', level: 'Intermediate', difficulty: 'Medium', hours: 6, provider: 'iGOT Karmayogi' },
  { id: 'IG-11', title: 'R Programming for Government Statistics', competencyId: 'C-PROG', level: 'Foundation', difficulty: 'Easy', hours: 10, provider: 'iGOT Karmayogi' },
  { id: 'IG-12', title: 'Python for Data Analysis', competencyId: 'C-PROG', level: 'Intermediate', difficulty: 'Medium', hours: 12, provider: 'iGOT Karmayogi' },
  { id: 'IG-13', title: 'Data Quality Management Frameworks', competencyId: 'C-DQUL', level: 'Intermediate', difficulty: 'Medium', hours: 8, provider: 'iGOT Karmayogi' },
  { id: 'IG-14', title: 'Project Management for Survey Operations', competencyId: 'C-PROJ', level: 'Intermediate', difficulty: 'Medium', hours: 10, provider: 'iGOT Karmayogi' },
  { id: 'IG-15', title: 'Introduction to GIS for Field Operations', competencyId: 'C-GIS', level: 'Foundation', difficulty: 'Easy', hours: 8, provider: 'iGOT Karmayogi' },
  { id: 'IG-16', title: 'Spatial Analysis for Official Statistics', competencyId: 'C-GIS', level: 'Advanced', difficulty: 'Hard', hours: 14, provider: 'iGOT Karmayogi' },
  { id: 'IG-17', title: 'Machine Learning Foundations', competencyId: 'C-ML', level: 'Intermediate', difficulty: 'Medium', hours: 12, provider: 'iGOT Karmayogi' },
  { id: 'IG-18', title: 'Report Writing for Government', competencyId: 'C-COMM', level: 'Foundation', difficulty: 'Easy', hours: 6, provider: 'iGOT Karmayogi' },
  { id: 'IG-19', title: 'Official Statistics in India', competencyId: 'C-OSTA', level: 'Foundation', difficulty: 'Easy', hours: 8, provider: 'iGOT Karmayogi' },
  { id: 'IG-20', title: 'Communication for Statistical Officers', competencyId: 'C-COMM', level: 'Intermediate', difficulty: 'Medium', hours: 8, provider: 'iGOT Karmayogi' },
];
export function courseById(id: string) { return IGOT_CATALOG.find(c => c.id === id); }
