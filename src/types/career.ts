export type TargetRole =
  | 'AI/ML Engineer'
  | 'Data Analyst'
  | 'Software Developer'
  | 'Web Developer'
  | 'Cybersecurity Analyst'
  | 'Data Scientist';

export const TARGET_ROLES: TargetRole[] = [
  'AI/ML Engineer',
  'Data Analyst',
  'Software Developer',
  'Web Developer',
  'Cybersecurity Analyst',
  'Data Scientist',
];

export const TRACKED_CORE_SKILLS = [
  'Python',
  'Java',
  'C++',
  'HTML and CSS',
  'JavaScript',
  'SQL',
  'Machine Learning',
  'Artificial Intelligence',
  'Data Science',
  'Communication',
] as const;

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  details: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  highlights: string[];
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  targetRole: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'demo' | 'text';
  extractedText: string;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  programmingSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  isDemo: boolean;
  createdAt?: unknown;
  createdAtIso?: string;
}

export interface ScoreBreakdownItem {
  category: string;
  earned: number;
  max: number;
  rationale: string;
}

export interface JobMatch {
  id: string;
  userId: string;
  resumeId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  compatibilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  scoreExplanation: string;
  scoreBreakdown: ScoreBreakdownItem[];
  isDemo: boolean;
  createdAt?: unknown;
  createdAtIso?: string;
}

export interface SkillGapItem {
  id: string;
  userId: string;
  skillName: string;
  category: 'programming' | 'technical' | 'soft';
  priority: 'High' | 'Medium' | 'Foundation';
  learningTopics: string[];
  completed: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RoadmapStep {
  stepId: string;
  phase: string;
  title: string;
  description: string;
  skillsCovered: string[];
  estimatedWeeks: number;
}

export interface RoadmapProjectSuggestion {
  title: string;
  difficulty: string;
  description: string;
  skillsApplied: string[];
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  targetRole: TargetRole;
  overview: string;
  steps: RoadmapStep[];
  recommendedSkills: string[];
  projectSuggestions: RoadmapProjectSuggestion[];
  completedStepIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InterviewSession {
  id: string;
  userId: string;
  targetRole: string;
  category: 'technical' | 'hr';
  question: string;
  sampleAnswer: string;
  userAnswer: string;
  aiFeedback: string;
  strengths: string[];
  improvements: string[];
  score: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdAtIso?: string;
}

export const FIELD_LIMITS = {
  id: 128,
  fileName: 200,
  extractedText: 34000,
  summary: 2900,
  jobTitle: 150,
  companyName: 150,
  jobDescription: 19500,
  scoreExplanation: 2900,
  overview: 1900,
  question: 1450,
  sampleAnswer: 3900,
  userAnswer: 5900,
  aiFeedback: 3900,
  skillName: 95,
} as const;
