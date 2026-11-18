import {
  ArrowRight,
  Briefcase,
  Compass,
  FileText,
  Layers,
  MessageSquareCode,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  CareerRoadmap,
  InterviewSession,
  JobMatch,
  ResumeAnalysis,
  SkillGapItem,
  UserProfile,
} from '../types/career';
import { AppSection } from './LandingView';
import { SkillCategoryChart } from './Charts';

interface DashboardViewProps {
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  resumes: ResumeAnalysis[];
  jobMatches: JobMatch[];
  skillGaps: SkillGapItem[];
  roadmaps: CareerRoadmap[];
  interviews: InterviewSession[];
  onNavigate: (section: AppSection) => void;
  onSelectResumeAndOpen: (resume: ResumeAnalysis) => void;
  onSelectMatchAndOpen: (match: JobMatch) => void;
  onRequestWipeData: () => void;
  onSignIn: () => void;
}

export function DashboardView({
  userProfile,
  isAuthenticated,
  resumes,
  jobMatches,
  skillGaps,
  roadmaps,
  interviews,
  onNavigate,
  onSelectResumeAndOpen,
  onSelectMatchAndOpen,
  onRequestWipeData,
  onSignIn,
}: DashboardViewProps) {
  const latestResume = resumes[0] || null;
  const bestScore =
    jobMatches.length > 0
      ? Math.max(...jobMatches.map((m) => m.compatibilityScore))
      : 0;

  const activeRoadmap = roadmaps[0] || null;
  const roadmapProgress =
    activeRoadmap && activeRoadmap.steps.length > 0
      ? Math.round(
          (activeRoadmap.completedStepIds.length / activeRoadmap.steps.length) * 100
        )
      : 0;

  const completedGaps = skillGaps.filter((s) => s.completed).length;
  const evaluatedInterviews = interviews.filter((i) => i.score > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {userProfile ? `Welcome back, ${userProfile.displayName}` : 'Career Workspace Overview'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isAuthenticated
              ? 'Your resumes, job matches, skill checklists, and interview practice are synced privately to your account.'
              : 'Exploring in session mode. Sign in with Google to save your career history privately across sessions.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              Sign In to Sync Data
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('analyzer')}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 cursor-pointer whitespace-nowrap"
          >
            Analyze New Resume
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Resumes Analyzed</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {resumes.length}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {latestResume ? latestResume.fileName : 'Upload PDF or DOCX'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Top Match Score</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {jobMatches.length > 0 ? `${bestScore}%` : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {jobMatches.length} saved comparison{jobMatches.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Roadmap Progress</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {activeRoadmap ? `${roadmapProgress}%` : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {activeRoadmap ? activeRoadmap.targetRole : 'Generate a career plan'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Skill &amp; Interview Prep</span>
            <Layers className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {completedGaps}/{skillGaps.length}
          </div>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {evaluatedInterviews.length} AI-scored interview answer{evaluatedInterviews.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detected Skills Overview */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Detected Skill Distribution</h2>
              <button
                type="button"
                onClick={() => onNavigate('analyzer')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Inspect
              </button>
            </div>
            {latestResume ? (
              <>
                <SkillCategoryChart
                  programmingCount={latestResume.programmingSkills.length}
                  technicalCount={latestResume.technicalSkills.length}
                  softCount={latestResume.softSkills.length}
                />
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {[
                    ...latestResume.programmingSkills.slice(0, 5),
                    ...latestResume.technicalSkills.slice(0, 4),
                  ].map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Analyze a resume to see your categorized programming, technical, and soft skills.
              </p>
            )}
          </div>
        </div>

        {/* Resume & Job Match History */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Recent Resume Analyses</h2>
              <button
                type="button"
                onClick={() => onNavigate('analyzer')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Open Analyzer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {resumes.length === 0 ? (
              <p className="text-xs text-slate-500">No resumes uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {resumes.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectResumeAndOpen(r)}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{r.fileName}</div>
                      <div className="text-xs text-slate-500">
                        {r.isDemo ? 'Demo Sample' : r.fileType.toUpperCase()}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600 tabular-nums shrink-0">
                      {r.programmingSkills.length + r.technicalSkills.length + r.softSkills.length} skills
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Job Matching History</h2>
              <button
                type="button"
                onClick={() => onNavigate('matching')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Compare Job <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {jobMatches.length === 0 ? (
              <p className="text-xs text-slate-500">No job comparisons saved yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {jobMatches.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMatchAndOpen(m)}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-slate-50 rounded-lg px-2 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{m.jobTitle}</div>
                      <div className="text-xs text-slate-500 truncate">{m.companyName}</div>
                    </div>
                    <span className="text-sm font-mono font-bold text-blue-700 tabular-nums shrink-0">
                      {m.compatibilityScore}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interview History & Data Privacy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-blue-600" />
              Interview Practice History
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('interview')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Practice Now
            </button>
          </div>
          {interviews.length === 0 ? (
            <p className="text-xs text-slate-500">No interview sessions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {interviews.slice(0, 4).map((intv) => (
                <div key={intv.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {intv.question}
                    </div>
                    <div className="text-xs text-slate-500">
                      {intv.category === 'hr' ? 'HR / Behavioral' : 'Technical'} · {intv.targetRole}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums shrink-0">
                    {intv.score > 0 ? `${intv.score}/100` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & Data Deletion */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Privacy &amp; Data Control
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Your uploaded resumes, extracted text, job comparisons, and interview feedback belong
              strictly to your account. You can permanently erase all saved records at any time.
            </p>
          </div>

          <button
            type="button"
            onClick={onRequestWipeData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Saved Resumes &amp; History
          </button>
        </div>
      </div>
    </div>
  );
}
