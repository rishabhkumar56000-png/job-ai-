import {
  CareerRoadmap,
  InterviewSession,
  JobMatch,
  ResumeAnalysis,
  SkillGapItem,
} from '../types/career';

export const DEMO_RESUME: ResumeAnalysis = {
  id: 'demo_resume_maya',
  userId: 'demo_user',
  fileName: 'Demo_Student_Resume_Maya_Lin.pdf',
  fileType: 'demo',
  extractedText: `MAYA LIN
B.S. in Computer Science — Expected May 2027 | State University
Email: maya.lin.demo@university.edu | Portfolio: github.com/mayalin-demo

EDUCATION
State University — Bachelor of Science in Computer Science (GPA: 3.78/4.0)
Relevant Coursework: Data Structures & Algorithms, Machine Learning Foundations, Database Systems, Linear Algebra

EXPERIENCE
Undergraduate Data Science Research Assistant | University AI Lab (Jan 2026 – Present)
- Built Python and scikit-learn preprocessing pipelines for 120,000+ academic citation records.
- Authored SQL analytical queries in PostgreSQL to measure model feature drift.
- Presented weekly experimental benchmarks and visualizations to faculty mentors.

Software Engineering Intern | Campus Transit Systems (May 2025 – Aug 2025)
- Developed interactive route-delay views using JavaScript, HTML, and CSS.
- Collaborated with a 4-student engineering team during daily standups and sprint demos.

PROJECTS
1. StudentCourse Recommender (Python, Scikit-Learn, SQL, Flask)
- Trained a collaborative filtering model recommending elective courses with 84% top-3 precision.
2. AlgoViz Sorting Sandbox (JavaScript, HTML and CSS, C++)
- Built an interactive sorting algorithm visualizer comparing runtime complexity.

SKILLS
Programming: Python, Java, C++, JavaScript, SQL, HTML and CSS
Technical: Machine Learning, Data Science, Git, PostgreSQL, REST APIs
Soft Skills: Communication, Technical Presentation, Team Collaboration`,
  summary:
    'Demo Profile: Strong undergraduate Computer Science candidate with hands-on academic research in Python, SQL, and Machine Learning alongside front-end web fundamentals (HTML, CSS, JavaScript). Well positioned for entry-level Data Science or AI/ML Engineering internships with targeted reinforcement in deep learning frameworks and cloud deployment.',
  education: [
    {
      institution: 'State University',
      degree: 'B.S. in Computer Science (GPA 3.78/4.0)',
      period: '2023 – Expected May 2027',
      details: 'Coursework: Data Structures & Algorithms, Machine Learning Foundations, Database Systems, Linear Algebra',
    },
  ],
  experience: [
    {
      role: 'Undergraduate Data Science Research Assistant',
      organization: 'University AI Lab',
      period: 'Jan 2026 – Present',
      highlights: [
        'Built Python and scikit-learn preprocessing pipelines for 120,000+ academic citation records.',
        'Wrote SQL analytical queries to track feature drift and presented weekly findings to faculty.',
      ],
    },
    {
      role: 'Software Engineering Intern',
      organization: 'Campus Transit Systems',
      period: 'May 2025 – Aug 2025',
      highlights: [
        'Built responsive route-delay interfaces using JavaScript, HTML, and CSS.',
        'Collaborated with a 4-student engineering team in agile sprint reviews.',
      ],
    },
  ],
  projects: [
    {
      title: 'StudentCourse Recommender',
      technologies: ['Python', 'Scikit-Learn', 'SQL', 'Flask'],
      description: 'Collaborative filtering engine recommending university electives with 84% top-3 precision.',
    },
    {
      title: 'AlgoViz Sorting Sandbox',
      technologies: ['JavaScript', 'HTML and CSS', 'C++'],
      description: 'Interactive algorithm visualization tool comparing time complexity across sorting approaches.',
    },
  ],
  strengths: [
    'Quantified impact across research and internship projects (120,000+ records, 84% precision).',
    'Balanced foundation across programming (Python, Java, C++, JavaScript, SQL) and ML concepts.',
    'Clear evidence of communication through weekly faculty benchmark presentations.',
  ],
  improvements: [
    'Production ML deployment tooling (Docker, FastAPI, cloud inference) is currently absent.',
    'Deep learning frameworks (PyTorch or TensorFlow) are not yet demonstrated in projects.',
    'No unit testing or CI/CD pipeline experience is mentioned in project descriptions.',
  ],
  suggestions: [
    'Add a deployed end-to-end ML API project using FastAPI and Docker with public documentation.',
    'Include automated test coverage metrics (e.g., pytest) in experience or project bullets.',
    'Specify SQL optimization outcomes (query latency reductions or indexing strategies).',
  ],
  programmingSkills: ['Python', 'Java', 'C++', 'JavaScript', 'SQL', 'HTML and CSS'],
  technicalSkills: ['Machine Learning', 'Data Science', 'PostgreSQL', 'REST APIs', 'Git'],
  softSkills: ['Communication', 'Technical Presentation', 'Team Collaboration'],
  isDemo: true,
  createdAtIso: '2026-11-18T10:00:00.000Z',
};

export const DEMO_JOB_DESCRIPTION = `Junior AI/ML Engineer — Meridian Health Analytics (Demo Listing)

About the Role:
We are seeking an early-career AI/ML Engineer to help build predictive clinical scheduling and patient triage tools.

Required Qualifications:
- Strong proficiency in Python and SQL for data extraction and model prototyping.
- Foundational experience with Machine Learning and Artificial Intelligence workflows.
- Experience with PyTorch or TensorFlow for model training and evaluation.
- Familiarity with Docker and REST APIs for deploying inference services.
- Strong Communication skills for explaining model assumptions to clinical stakeholders.

Preferred Skills:
- JavaScript or TypeScript familiarity for internal evaluation dashboards.
- Data Science experimentation and statistical validation.`;

export const DEMO_JOB_MATCH: JobMatch = {
  id: 'demo_match_1',
  userId: 'demo_user',
  resumeId: 'demo_resume_maya',
  jobTitle: 'Junior AI/ML Engineer',
  companyName: 'Meridian Health Analytics (Demo)',
  jobDescription: DEMO_JOB_DESCRIPTION,
  compatibilityScore: 74,
  matchedSkills: [
    'Python',
    'SQL',
    'Machine Learning',
    'Data Science',
    'REST APIs',
    'JavaScript',
    'Communication',
  ],
  missingSkills: ['Artificial Intelligence (LLM/GenAI)', 'PyTorch / TensorFlow', 'Docker'],
  scoreExplanation:
    'Demo Estimate: 74/100 based on explicit evidence in the demo resume. Core programming languages (Python, SQL, JavaScript) and foundational ML/Data Science research match 7 of 10 job criteria. Points were deducted because PyTorch/TensorFlow, containerization (Docker), and applied Artificial Intelligence system design are not evidenced in the resume. This score is an analytical guide and never guarantees employment.',
  scoreBreakdown: [
    {
      category: 'Core Programming & SQL',
      earned: 28,
      max: 30,
      rationale: 'Python, SQL, and JavaScript are directly verified across coursework and internships.',
    },
    {
      category: 'AI & ML Frameworks',
      earned: 20,
      max: 35,
      rationale: 'Scikit-Learn and Data Science research are present, but PyTorch/TensorFlow and Generative AI are missing.',
    },
    {
      category: 'Deployment & Engineering',
      earned: 12,
      max: 20,
      rationale: 'REST APIs and Flask are present, while Docker containerization is absent.',
    },
    {
      category: 'Communication & Collaboration',
      earned: 14,
      max: 15,
      rationale: 'Weekly faculty presentations and agile sprint collaboration demonstrate strong communication.',
    },
  ],
  isDemo: true,
  createdAtIso: '2026-11-18T10:05:00.000Z',
};

export const DEMO_SKILL_GAPS: SkillGapItem[] = [
  {
    id: 'demo_gap_pytorch',
    userId: 'demo_user',
    skillName: 'PyTorch / Deep Learning',
    category: 'technical',
    priority: 'High',
    learningTopics: [
      'Tensors, autograd, and custom Dataset/DataLoader pipelines',
      'Training & evaluating neural networks with validation splits',
      'Model checkpointing and ONNX export',
    ],
    completed: false,
  },
  {
    id: 'demo_gap_ai',
    userId: 'demo_user',
    skillName: 'Artificial Intelligence Systems',
    category: 'technical',
    priority: 'High',
    learningTopics: [
      'Prompt engineering & structured JSON extraction',
      'Retrieval-Augmented Generation (RAG) architecture',
      'Evaluation benchmarks and hallucination guardrails',
    ],
    completed: false,
  },
  {
    id: 'demo_gap_docker',
    userId: 'demo_user',
    skillName: 'Docker & Model Serving',
    category: 'technical',
    priority: 'Medium',
    learningTopics: [
      'Multi-stage Dockerfiles for Python FastAPI services',
      'Environment isolation and healthcheck endpoints',
      'Containerized local testing before cloud deployment',
    ],
    completed: true,
  },
];

export const DEMO_ROADMAP: CareerRoadmap = {
  id: 'demo_roadmap_aiml',
  userId: 'demo_user',
  targetRole: 'AI/ML Engineer',
  overview:
    'Demo 12-week transition plan tailored to bridge undergraduate Python/SQL research into production AI/ML engineering readiness.',
  steps: [
    {
      stepId: 'step_1',
      phase: 'Weeks 1–3',
      title: 'Deep Learning Foundations with PyTorch',
      description: 'Transition from classical scikit-learn pipelines to neural network training loops, loss diagnostics, and reproducibility.',
      skillsCovered: ['Python', 'PyTorch', 'Machine Learning'],
      estimatedWeeks: 3,
    },
    {
      stepId: 'step_2',
      phase: 'Weeks 4–6',
      title: 'Applied Artificial Intelligence & Evaluation',
      description: 'Build retrieval pipelines, embeddings indexing, and automated evaluation harnesses for LLM-backed applications.',
      skillsCovered: ['Artificial Intelligence', 'SQL', 'Data Science'],
      estimatedWeeks: 3,
    },
    {
      stepId: 'step_3',
      phase: 'Weeks 7–9',
      title: 'Production Model Serving & Testing',
      description: 'Package inference endpoints in FastAPI and Docker with pytest regression suites and latency monitoring.',
      skillsCovered: ['Docker', 'REST APIs', 'CI/CD'],
      estimatedWeeks: 3,
    },
    {
      stepId: 'step_4',
      phase: 'Weeks 10–12',
      title: 'Portfolio Capstone & Technical Storytelling',
      description: 'Publish an end-to-end deployed ML repository with architecture diagrams and clear metric trade-offs.',
      skillsCovered: ['Communication', 'System Design'],
      estimatedWeeks: 3,
    },
  ],
  recommendedSkills: ['Python', 'Machine Learning', 'Artificial Intelligence', 'SQL', 'PyTorch', 'Docker', 'Communication'],
  projectSuggestions: [
    {
      title: 'Clinical Triage Wait-Time Predictor API',
      difficulty: 'Intermediate',
      description: 'Train a tabular gradient-boosted + neural baseline model, expose predictions via FastAPI, and containerize with Docker.',
      skillsApplied: ['Python', 'Machine Learning', 'SQL', 'Docker'],
    },
    {
      title: 'Academic Paper Semantic Search Assistant',
      difficulty: 'Advanced',
      description: 'Index 10,000 research abstracts using vector embeddings and build an evaluation suite measuring retrieval precision.',
      skillsApplied: ['Artificial Intelligence', 'Python', 'Data Science'],
    },
  ],
  completedStepIds: ['step_1'],
};

export const DEMO_INTERVIEW_SESSIONS: InterviewSession[] = [
  {
    id: 'demo_int_1',
    userId: 'demo_user',
    targetRole: 'AI/ML Engineer',
    category: 'technical',
    question:
      'How do you detect and mitigate data leakage when building a supervised Machine Learning pipeline?',
    sampleAnswer:
      'Data leakage happens when information from outside the training split influences feature engineering or scaling. To prevent it, I split the dataset into train, validation, and test sets first—respecting temporal ordering for time-series data—and fit all encoders, imputers, and scalers strictly inside a scikit-learn Pipeline on the training fold only.',
    userAnswer: '',
    aiFeedback: '',
    strengths: [],
    improvements: [],
    score: 0,
    createdAtIso: '2026-11-18T10:15:00.000Z',
  },
  {
    id: 'demo_int_2',
    userId: 'demo_user',
    targetRole: 'AI/ML Engineer',
    category: 'hr',
    question:
      'Tell me about a time you had to explain a complex technical finding to a non-technical stakeholder.',
    sampleAnswer:
      'During my research assistantship, faculty advisors wanted to know why precision dropped on older archive records. Instead of quoting F1 curves, I showed three concrete misclassified examples, linked them to missing date metadata, and proposed a targeted validation rule that improved reliability by 9%.',
    userAnswer: '',
    aiFeedback: '',
    strengths: [],
    improvements: [],
    score: 0,
    createdAtIso: '2026-11-18T10:20:00.000Z',
  },
];
