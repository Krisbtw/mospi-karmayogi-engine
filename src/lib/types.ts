export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuizType = 'MCQ' | 'Conceptual' | 'Scenario-based';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | 'Complete';

export interface Employee {
  id: string; name: string; department: string; designation: string; role: string;
  yearsExperience: number; location: string; functionalArea: string; cadreRank: string;
}

export interface CourseRecord {
  employeeId: string; title: string; provider: string; competencyId: string;
  completedOn: string; score: number; certificate: boolean; hours: number;
  source: 'history' | 'igot-demo' | 'igot-live';
}

export interface CompetencyState { employeeId: string; competencyId: string; current: number; updatedAt: string; }

export interface BankQuestion {
  id: string; question: string; options: string[]; correctIndex: number;
  explanation: string; difficulty: Difficulty; bloom: string; competencyId: string;
}

export interface GeneratedQuestion {
  id: string; question: string; options: string[]; correctIndex: number;
  explanation: string; difficulty: Difficulty; bloom: string; type: QuizType;
  competencyId: string; sourceDocId: string; sourceDocTitle: string;
  sourceSection: string; chunkIndex: number; evidence: string; confidence: number;
}

export interface Assessment {
  id: string; employeeId: string; role: string; status: 'in-progress' | 'completed';
  createdAt: string; completedAt?: string; questions: BankQuestion[];
  answers?: Record<string, number>; overall?: number;
}

export interface Quiz {
  id: string; title: string; documentId: string; competencyId: string;
  mode: 'ai' | 'demo'; createdAt: string; questions: GeneratedQuestion[];
}

export interface Attempt {
  id: string; employeeId: string; quizId: string; competencyId: string;
  correct: number; total: number; percent: number; before: number;
  after: number; improvement: number; createdAt: string;
}

export interface DocRecord {
  id: string; title: string; filename: string; kind: 'pdf' | 'docx' | 'pptx' | 'txt';
  sections: { label: string; text: string }[]; uploadedAt: string; chunkCount: number;
}

export interface Chunk {
  id: string; docId: string; docTitle: string; section: string;
  index: number; text: string; embedding: number[];
}

export type EventType = 'diagnostic' | 'reassessment' | 'course-completion' | 'ai-quiz' | 'enrollment';

export interface CompetencyEvent {
  id: string; employeeId: string; competencyId: string; type: EventType;
  before?: number; after?: number; detail: string; createdAt: string;
}

export interface Enrollment { employeeId: string; courseId: string; status: 'enrolled' | 'completed'; enrolledAt: string; }

export interface GapRow {
  competencyId: string; name: string; domain: string; required: number;
  current: number; gap: number; priority: Priority;
}

export interface PathItem {
  courseId: string; title: string; provider: string; level: string; levelRank: number;
  difficulty: Difficulty; hours: number; competencyId: string; competencyName: string;
  current: number; required: number; status: 'Recommended' | 'In Progress'; url: string;
}

export interface PathPhase { name: string; description: string; items: PathItem[]; cta?: 'assessment'; }

export interface CatalogCourse {
  id: string; title: string; competencyId: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced'; difficulty: Difficulty;
  hours: number; provider: string;
}

export interface DB {
  employees: Employee[]; courses: CourseRecord[]; competencies: CompetencyState[];
  assessments: Assessment[]; quizzes: Quiz[]; attempts: Attempt[]; documents: DocRecord[];
  chunks: Chunk[]; events: CompetencyEvent[]; enrollments: Enrollment[];
}
