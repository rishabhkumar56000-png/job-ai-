import { motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Compass,
  FileSearch,
  Layers,
  MessageSquareCode,
  ShieldCheck,
  Upload,
} from 'lucide-react';

export type AppSection =
  | 'landing'
  | 'dashboard'
  | 'analyzer'
  | 'matching'
  | 'gaps'
  | 'roadmap'
  | 'interview';

interface LandingViewProps {
  onUploadResume: () => void;
  onExploreFeatures: () => void;
  onLoadDemoWorkspace: () => void;
  onNavigate: (section: AppSection) => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

export function LandingView({
  onUploadResume,
  onExploreFeatures,
  onLoadDemoWorkspace,
  onNavigate,
  isAuthenticated,
  onSignIn,
}: LandingViewProps) {
  return (
    <div className="bg-white text-slate-900">
      {/* Hero Section: Dark Navy & Crisp Accent Split */}
      <section className="relative bg-[#0B1120] text-white border-b border-slate-800 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.20),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.14),transparent_50%)]"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <p className="text-sm font-medium text-blue-300 tracking-wide mb-4">
                JobMatch AI — Your Skills. Your Career. Your Future.
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] text-balance text-white mb-6">
                Find Your Career Direction with AI
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8">
                An intelligent career assistant for students. Parse PDF and Word resumes, inspect
                verified technical and soft skills, calculate explainable job compatibility scores,
                and build structured roadmaps toward your target engineering or analytics role.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onUploadResume}
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  Upload Resume
                </button>
                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-100 border border-slate-700 bg-slate-900/60 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Explore Features
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onLoadDemoWorkspace}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Try Live Demo Sample
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex"
            >
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[280px] lg:min-h-[380px]">
                <img
                  src="/src/assets/images/hero_career_workspace_1795030358309.jpg"
                  alt="Student analyzing resume skills and career roadmap metrics on a dark navy dashboard"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover lg:h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/85 via-[#0B1120]/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4 text-xs text-slate-200">
                  <span>PDF &amp; DOCX Real Text Extraction</span>
                  <span aria-hidden="true">·</span>
                  <span>Explainable Score Breakdown</span>
                  <span aria-hidden="true">·</span>
                  <span>Private User History</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full-width 4-column workflow strip below hero */}
          <div className="mt-14 pt-8 border-t border-slate-800/90 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold tabular-nums text-white">PDF / DOCX</div>
              <p className="text-xs text-slate-400 mt-1">Validated resume parsing without fabricating skills</p>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-white">10+ Core Skills</div>
              <p className="text-xs text-slate-400 mt-1">Categorized programming, technical, and soft skills</p>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-white">6 Career Tracks</div>
              <p className="text-xs text-slate-400 mt-1">AI/ML, Data Science, Web, Software &amp; Security</p>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-white">Technical + HR</div>
              <p className="text-xs text-slate-400 mt-1">Practice answers evaluated with constructive AI feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Asymmetric Bento Showcase */}
      <section id="features-section" className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-blue-600 mb-2">Platform Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            Built for transparent, evidence-based career planning
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Every workflow connects your real resume evidence to concrete role expectations—without
            black-box promises or fabricated qualifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Wide Card: Resume Analyzer & Skill Detector */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="h-56 sm:h-64 bg-slate-100 overflow-hidden border-b border-slate-200">
              <img
                src="/src/assets/images/feature_resume_intelligence_1795030357911.jpg"
                alt="Resume document next to skill taxonomy analysis screen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                  <span>01. Resume Analyzer &amp; Skill Detector</span>
                  <span aria-hidden="true">·</span>
                  <span>PDF &amp; DOCX</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Extract education, projects, and categorized skills
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Upload your resume to inspect extracted text, review an AI summary grounded strictly
                  in your document, highlight strengths, and detect Python, Java, C++, SQL, Machine
                  Learning, AI, and Communication skills.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('analyzer')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Open Resume Analyzer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Dark Navy Card: Explainable Job Matching */}
          <div className="lg:col-span-5 bg-[#0F172A] text-white border border-slate-800 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                <span>02. Explainable Job Matching</span>
                <span aria-hidden="true">·</span>
                <span>Zero Guarantees</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Transparent compatibility scoring against real job descriptions
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Paste any internship or full-time posting to compare requirements against your resume.
                Inspect matched skills, missing skills, and a point-by-point explanation of how your
                alignment score was calculated.
              </p>

              <div className="space-y-3 border-t border-slate-800 pt-5 mb-6 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Core Programming &amp; SQL</span>
                  <span className="font-mono tabular-nums text-blue-300">40 pts max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Domain &amp; Applied Frameworks</span>
                  <span className="font-mono tabular-nums text-indigo-300">25 pts max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Relevant Projects &amp; Experience</span>
                  <span className="font-mono tabular-nums text-slate-300">20 pts max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Communication &amp; Soft Skills</span>
                  <span className="font-mono tabular-nums text-slate-300">15 pts max</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('matching')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Compare a Job Description
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Skill Gap Checklist */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">03. Skill Gap Analyzer</p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Actionable improvement checklist
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Turn missing skills into concrete study topics, track completion progress, and keep
                your improvement milestones synced to your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gaps')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View Skill Checklist
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Career Roadmap */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">04. Personalized Roadmaps</p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Step-by-step plans for 6 tech tracks
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Generate tailored timelines, project ideas, and skill priorities for AI/ML Engineer,
                Data Analyst, Software Developer, Web Developer, Cybersecurity Analyst, or Data Scientist.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('roadmap')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Build Career Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 5: AI Interview Studio */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="h-36 bg-slate-100 overflow-hidden border-b border-slate-200">
              <img
                src="/src/assets/images/feature_interview_studio_1795030388642.jpg"
                alt="Technical interview preparation desk with laptop and notes"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">05. AI Interview Prep</p>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Technical &amp; HR practice feedback
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Practice with role-specific questions, compare against benchmark sample answers,
                  and receive structured AI feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('interview')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Start Interview Practice
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Assurance Band */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Private Resume Storage</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Uploaded files are validated on the server and user-scoped in Firestore with strict
                  owner-only security rules. Delete your saved records anytime.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <FileSearch className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">No Fabricated Qualifications</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  AI prompts strictly extract only skills and projects evidenced in your uploaded
                  resume text, keeping every recommendation honest.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <BarChart3 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Explainable Career Metrics</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every match percentage shows an exact weighted point breakdown and never makes
                  unrealistic employment guarantees.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ready to analyze your resume and save your career progress?</span>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In with Google
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Open Dashboard
                </button>
              )}
              <button
                type="button"
                onClick={onUploadResume}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer whitespace-nowrap"
              >
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-800">JobMatch AI</span>
            <span aria-hidden="true">·</span>
            <span>Your Skills. Your Career. Your Future.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate('analyzer')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Resume Analyzer
            </button>
            <button
              type="button"
              onClick={() => onNavigate('matching')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Job Matching
            </button>
            <button
              type="button"
              onClick={() => onNavigate('roadmap')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Career Roadmaps
            </button>
            <button
              type="button"
              onClick={() => onNavigate('interview')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Interview Prep
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
