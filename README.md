# JobMatch AI

**Your Skills. Your Career. Your Future.**

JobMatch AI is a full-stack AI-powered career assistant built for students to analyze resumes, identify categorized skills, compare themselves against job descriptions with explainable scoring, close skill gaps, generate personalized career roadmaps, and practice interviews.

## Key Features

- **Resume Analyzer & Skill Detector**: Upload PDF or DOCX resumes for server-side text extraction (`pdfjs-dist` & `mammoth`), editable text review, grounded Gemini AI analysis, and categorized detection of programming, technical, and soft skills.
- **Explainable AI Job Matching**: Compare resume skills against any job description with matched/missing skills, a weighted compatibility breakdown, and transparent scoring notes.
- **Skill Gap Analyzer**: Turn missing or target skills into prioritized study topics with an interactive completion checklist.
- **Personalized Career Roadmaps**: Generate multi-phase learning plans, recommended skills, and portfolio project ideas for AI/ML Engineer, Data Analyst, Software Developer, Web Developer, Cybersecurity Analyst, and Data Scientist.
- **AI Interview Preparation**: Practice technical and HR/behavioral questions with sample benchmarks and AI-generated answer coaching.
- **Private User Dashboard**: Google Sign-In via Firebase Authentication with owner-only Cloud Firestore storage and full data deletion controls.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Vite
- **Backend**: Node.js, Express, Multer, `pdfjs-dist`, `mammoth`
- **AI**: Google Gemini API (`@google/genai` server-side)
- **Auth & Persistence**: Firebase Authentication & Cloud Firestore

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```
3. Start the development server (runs Express + Vite on port `3000`):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```
