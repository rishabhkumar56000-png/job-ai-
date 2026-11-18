import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  Briefcase,
  Compass,
  FileSearch,
  Layers,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  MessageSquareCode,
  ShieldAlert,
  X,
} from 'lucide-react';
import { auth, googleProvider } from './lib/firebase';
import {
  createClientId,
  deleteAllUserSavedData,
  deleteInterviewSession,
  deleteJobMatch,
  deleteResumeAnalysis,
  deleteSkillGapItem,
  ensureUserProfile,
  saveCareerRoadmap,
  saveInterviewSession,
  saveJobMatch,
  saveResumeAnalysis,
  saveSkillGapItems,
  subscribeUserCollection,
  toggleSkillGapCompletion,
  updateInterviewEvaluation,
  updateRoadmapCompletedSteps,
} from './lib/firestoreService';
import {
  CareerRoadmap,
  InterviewSession,
  JobMatch,
  ResumeAnalysis,
  SkillGapItem,
  TargetRole,
  UserProfile,
} from './types/career';
import {
  DEMO_INTERVIEW_SESSIONS,
  DEMO_JOB_MATCH,
  DEMO_RESUME,
  DEMO_ROADMAP,
  DEMO_SKILL_GAPS,
} from './data/demoData';
import { AppSection, LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ResumeAnalyzerView } from './components/ResumeAnalyzerView';
import { JobMatchingView } from './components/JobMatchingView';
import { SkillGapView } from './components/SkillGapView';
import { RoadmapView } from './components/RoadmapView';
import { InterviewPrepView } from './components/InterviewPrepView';

const NAV_ITEMS: { id: AppSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyzer', label: 'Analyzer', icon: FileSearch },
  { id: 'matching', label: 'Job Match', icon: Briefcase },
  { id: 'gaps', label: 'Skill Gaps', icon: Layers },
  { id: 'roadmap', label: 'Roadmap', icon: Compass },
  { id: 'interview', label: 'Interview', icon: MessageSquareCode },
];

export default function App() {
  const [section, setSection] = useState<AppSection>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth & Profile state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Cloud-synced collections (when signed in) + session fallback (when exploring signed out)
  const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([]);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);

  // Active selections
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  // Wipe confirmation modal
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const profile = await ensureUserProfile({
            uid: user.uid,
            email: user.email || 'student@example.com',
            displayName: user.displayName || 'Student',
          });
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to sync profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !authUser) return;

    const unsubResumes = subscribeUserCollection<ResumeAnalysis>(
      authUser.uid,
      'resumes',
      (items) => setResumes(items)
    );
    const unsubMatches = subscribeUserCollection<JobMatch>(
      authUser.uid,
      'jobMatches',
      (items) => setJobMatches(items)
    );
    const unsubGaps = subscribeUserCollection<SkillGapItem>(
      authUser.uid,
      'skillProgress',
      (items) => setSkillGaps(items)
    );
    const unsubRoadmaps = subscribeUserCollection<CareerRoadmap>(
      authUser.uid,
      'roadmaps',
      (items) => setRoadmaps(items)
    );
    const unsubInterviews = subscribeUserCollection<InterviewSession>(
      authUser.uid,
      'interviews',
      (items) => setInterviews(items)
    );

    return () => {
      unsubResumes();
      unsubMatches();
      unsubGaps();
      unsubRoadmaps();
      unsubInterviews();
    };
  }, [authReady, authUser]);

  const handleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (section === 'landing') {
        setSection('dashboard');
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Sign in was cancelled or failed.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setResumes([]);
    setJobMatches([]);
    setSkillGaps([]);
    setRoadmaps([]);
    setInterviews([]);
    setSelectedResumeId(null);
    setSelectedMatchId(null);
    setSelectedRoadmapId(null);
    setSection('landing');
  };

  const loadDemoIntoWorkspace = (goTo: AppSection = 'analyzer') => {
    setResumes((prev) =>
      prev.some((r) => r.id === DEMO_RESUME.id) ? prev : [DEMO_RESUME, ...prev]
    );
    setJobMatches((prev) =>
      prev.some((m) => m.id === DEMO_JOB_MATCH.id) ? prev : [DEMO_JOB_MATCH, ...prev]
    );
    setSkillGaps((prev) => (prev.length > 0 ? prev : DEMO_SKILL_GAPS));
    setRoadmaps((prev) =>
      prev.some((r) => r.id === DEMO_ROADMAP.id) ? prev : [DEMO_ROADMAP, ...prev]
    );
    setInterviews((prev) => (prev.length > 0 ? prev : DEMO_INTERVIEW_SESSIONS));

    setSelectedResumeId(DEMO_RESUME.id);
    setSelectedMatchId(DEMO_JOB_MATCH.id);
    setSelectedRoadmapId(DEMO_ROADMAP.id);
    setSection(goTo);
  };

  const activeResume =
    resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;
  const activeMatch =
    jobMatches.find((m) => m.id === selectedMatchId) || jobMatches[0] || null;
  const activeRoadmap =
    roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0] || null;

  const targetRole = (userProfile?.targetRole as TargetRole) || 'AI/ML Engineer';

  // Handlers supporting both cloud persistence (signed in) and local session (signed out)
  const handleSaveAnalyzedResume = async (
    analysis: Omit<ResumeAnalysis, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
  ) => {
    if (authUser) {
      const saved = await saveResumeAnalysis(authUser.uid, analysis);
      setSelectedResumeId(saved.id);
    } else {
      const localItem: ResumeAnalysis = {
        ...analysis,
        id: createClientId('local_res'),
        userId: 'session',
        createdAtIso: new Date().toISOString(),
      };
      setResumes((prev) => [localItem, ...prev]);
      setSelectedResumeId(localItem.id);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (authUser && !resumeId.startsWith('local_') && !resumeId.startsWith('demo_')) {
      await deleteResumeAnalysis(authUser.uid, resumeId);
    } else {
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    }
    if (selectedResumeId === resumeId) setSelectedResumeId(null);
  };

  const handleSaveMatch = async (
    match: Omit<JobMatch, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
  ) => {
    if (authUser) {
      const saved = await saveJobMatch(authUser.uid, match);
      setSelectedMatchId(saved.id);
    } else {
      const localItem: JobMatch = {
        ...match,
        id: createClientId('local_match'),
        userId: 'session',
        createdAtIso: new Date().toISOString(),
      };
      setJobMatches((prev) => [localItem, ...prev]);
      setSelectedMatchId(localItem.id);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (authUser && !matchId.startsWith('local_') && !matchId.startsWith('demo_')) {
      await deleteJobMatch(authUser.uid, matchId);
    } else {
      setJobMatches((prev) => prev.filter((m) => m.id !== matchId));
    }
    if (selectedMatchId === matchId) setSelectedMatchId(null);
  };

  const handleGenerateSkillGaps = async (skills: string[], role: TargetRole) => {
    const res = await fetch('/api/skill-gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missingSkills: skills, targetRole: role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate skill gap topics.');
    }
    const items = (data.items || []) as Array<{
      skillName: string;
      category: 'programming' | 'technical' | 'soft';
      priority: 'High' | 'Medium' | 'Foundation';
      learningTopics: string[];
    }>;

    if (authUser) {
      await saveSkillGapItems(
        authUser.uid,
        items.map((item) => ({ ...item, completed: false }))
      );
    } else {
      const localItems: SkillGapItem[] = items.map((item) => ({
        ...item,
        id: createClientId('local_gap'),
        userId: 'session',
        completed: false,
      }));
      setSkillGaps((prev) => [...localItems, ...prev]);
    }
  };

  const handleToggleSkillGap = async (skillId: string, completed: boolean) => {
    if (authUser && !skillId.startsWith('local_') && !skillId.startsWith('demo_')) {
      await toggleSkillGapCompletion(authUser.uid, skillId, completed);
    } else {
      setSkillGaps((prev) =>
        prev.map((s) => (s.id === skillId ? { ...s, completed } : s))
      );
    }
  };

  const handleDeleteSkillGap = async (skillId: string) => {
    if (authUser && !skillId.startsWith('local_') && !skillId.startsWith('demo_')) {
      await deleteSkillGapItem(authUser.uid, skillId);
    } else {
      setSkillGaps((prev) => prev.filter((s) => s.id !== skillId));
    }
  };

  const handleGenerateRoadmap = async (role: TargetRole, currentSkills: string[]) => {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: role, currentSkills }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate roadmap.');
    }

    if (authUser) {
      const saved = await saveCareerRoadmap(authUser.uid, {
        targetRole: role,
        overview: data.overview || '',
        steps: Array.isArray(data.steps) ? data.steps : [],
        recommendedSkills: Array.isArray(data.recommendedSkills) ? data.recommendedSkills : [],
        projectSuggestions: Array.isArray(data.projectSuggestions) ? data.projectSuggestions : [],
        completedStepIds: [],
      });
      setSelectedRoadmapId(saved.id);
    } else {
      const localItem: CareerRoadmap = {
        id: `local_roadmap_${role}`,
        userId: 'session',
        targetRole: role,
        overview: data.overview || '',
        steps: Array.isArray(data.steps) ? data.steps : [],
        recommendedSkills: Array.isArray(data.recommendedSkills) ? data.recommendedSkills : [],
        projectSuggestions: Array.isArray(data.projectSuggestions) ? data.projectSuggestions : [],
        completedStepIds: [],
      };
      setRoadmaps((prev) => [localItem, ...prev.filter((r) => r.targetRole !== role)]);
      setSelectedRoadmapId(localItem.id);
    }
  };

  const handleToggleRoadmapStep = async (roadmapId: string, stepId: string) => {
    const target = roadmaps.find((r) => r.id === roadmapId);
    if (!target) return;
    const exists = target.completedStepIds.includes(stepId);
    const updated = exists
      ? target.completedStepIds.filter((id) => id !== stepId)
      : [...target.completedStepIds, stepId];

    if (authUser && !roadmapId.startsWith('local_') && !roadmapId.startsWith('demo_')) {
      await updateRoadmapCompletedSteps(authUser.uid, roadmapId, updated);
    } else {
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === roadmapId ? { ...r, completedStepIds: updated } : r))
      );
    }
  };

  const handleGenerateInterviewQuestions = async (
    role: TargetRole,
    category: 'technical' | 'hr',
    skills: string[]
  ) => {
    const res = await fetch('/api/interview/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: role, category, resumeSkills: skills }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate interview questions.');
    }
    const questions = (data.questions || []) as Array<{
      question: string;
      sampleAnswer: string;
    }>;

    if (authUser) {
      for (const q of questions) {
        await saveInterviewSession(authUser.uid, {
          targetRole: role,
          category,
          question: q.question,
          sampleAnswer: q.sampleAnswer,
          userAnswer: '',
          aiFeedback: '',
          strengths: [],
          improvements: [],
          score: 0,
        });
      }
    } else {
      const created: InterviewSession[] = questions.map((q) => ({
        id: createClientId('local_int'),
        userId: 'session',
        targetRole: role,
        category,
        question: q.question,
        sampleAnswer: q.sampleAnswer,
        userAnswer: '',
        aiFeedback: '',
        strengths: [],
        improvements: [],
        score: 0,
        createdAtIso: new Date().toISOString(),
      }));
      setInterviews((prev) => [...created, ...prev]);
    }
  };

  const handleEvaluateInterview = async (session: InterviewSession, userAnswer: string) => {
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: session.targetRole,
        category: session.category,
        question: session.question,
        sampleAnswer: session.sampleAnswer,
        userAnswer,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to evaluate interview response.');
    }

    const evalPayload = {
      userAnswer,
      aiFeedback: data.aiFeedback || '',
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      score: Number(data.score) || 0,
    };

    if (authUser && !session.id.startsWith('local_') && !session.id.startsWith('demo_')) {
      await updateInterviewEvaluation(authUser.uid, session.id, evalPayload);
    } else {
      setInterviews((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, ...evalPayload } : s))
      );
    }
  };

  const handleDeleteInterview = async (sessionId: string) => {
    if (authUser && !sessionId.startsWith('local_') && !sessionId.startsWith('demo_')) {
      await deleteInterviewSession(authUser.uid, sessionId);
    } else {
      setInterviews((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleConfirmWipeAllData = async () => {
    setWiping(true);
    try {
      if (authUser) {
        await deleteAllUserSavedData(authUser.uid);
      }
      setResumes([]);
      setJobMatches([]);
      setSkillGaps([]);
      setRoadmaps([]);
      setInterviews([]);
      setSelectedResumeId(null);
      setSelectedMatchId(null);
      setSelectedRoadmapId(null);
      setConfirmWipeOpen(false);
    } finally {
      setWiping(false);
    }
  };

  const scrollToFeatures = () => {
    setSection('landing');
    setTimeout(() => {
      document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setSection('landing')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-blue-600 to-indigo-600 inline-block" />
            JobMatch AI
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setSection('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'dashboard' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setSection('analyzer')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'analyzer' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Analyzer
            </button>
            <button
              type="button"
              onClick={() => setSection('matching')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'matching' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Job Match
            </button>
            <button
              type="button"
              onClick={() => setSection('roadmap')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'roadmap' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Roadmaps
            </button>
            <button
              type="button"
              onClick={() => setSection('interview')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                section === 'interview' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Interview
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {authUser ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void handleSignIn()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {authLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                    section === item.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {authError && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-800 text-center">
          {authError}
        </div>
      )}

      {/* Main Content */}
      {section === 'landing' ? (
        <main className="flex-1">
          <LandingView
            onUploadResume={() => setSection('analyzer')}
            onExploreFeatures={scrollToFeatures}
            onLoadDemoWorkspace={() => loadDemoIntoWorkspace('analyzer')}
            onNavigate={(s) => setSection(s)}
            isAuthenticated={Boolean(authUser)}
            onSignIn={() => void handleSignIn()}
          />
        </main>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 flex flex-col lg:flex-row gap-8">
          {/* Workspace Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#0F172A] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {!authUser && (
              <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-blue-300">Cloud Persistence</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in with Google to save resumes, match scores, and roadmap checkpoints privately.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSignIn()}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            )}

            {authUser && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {userProfile?.displayName || authUser.displayName || 'Student'}
                </div>
                <div className="text-xs text-slate-500 truncate">{authUser.email}</div>
              </div>
            )}
          </aside>

          {/* Active Workspace Viewport */}
          <main className="flex-1 min-w-0">
            {section === 'dashboard' && (
              <DashboardView
                userProfile={userProfile}
                isAuthenticated={Boolean(authUser)}
                resumes={resumes}
                jobMatches={jobMatches}
                skillGaps={skillGaps}
                roadmaps={roadmaps}
                interviews={interviews}
                onNavigate={(s) => setSection(s)}
                onSelectResumeAndOpen={(r) => {
                  setSelectedResumeId(r.id);
                  setSection('analyzer');
                }}
                onSelectMatchAndOpen={(m) => {
                  setSelectedMatchId(m.id);
                  setSection('matching');
                }}
                onRequestWipeData={() => setConfirmWipeOpen(true)}
                onSignIn={() => void handleSignIn()}
              />
            )}

            {section === 'analyzer' && (
              <ResumeAnalyzerView
                activeResume={activeResume}
                resumes={resumes}
                onSelectResume={(r) => setSelectedResumeId(r.id)}
                onSaveAnalyzedResume={handleSaveAnalyzedResume}
                onDeleteResume={handleDeleteResume}
                onLoadDemo={() => loadDemoIntoWorkspace('analyzer')}
                onGoToJobMatch={() => setSection('matching')}
              />
            )}

            {section === 'matching' && (
              <JobMatchingView
                activeResume={activeResume}
                jobMatches={jobMatches}
                activeMatch={activeMatch}
                onSelectMatch={(m) => setSelectedMatchId(m.id)}
                onSaveMatch={handleSaveMatch}
                onDeleteMatch={handleDeleteMatch}
                onSendMissingToGaps={async (missingSkills) => {
                  await handleGenerateSkillGaps(missingSkills, targetRole);
                  setSection('gaps');
                }}
                onGoToAnalyzer={() => setSection('analyzer')}
              />
            )}

            {section === 'gaps' && (
              <SkillGapView
                skillGaps={skillGaps}
                targetRole={targetRole}
                onGenerateSkillGaps={handleGenerateSkillGapWrapper}
                onToggleCompleted={handleToggleSkillGap}
                onDeleteSkillGap={handleDeleteSkillGap}
              />
            )}

            {section === 'roadmap' && (
              <RoadmapView
                roadmaps={roadmaps}
                activeRoadmap={activeRoadmap}
                activeResume={activeResume}
                targetRole={targetRole}
                onSelectRoadmap={(r) => setSelectedRoadmapId(r.id)}
                onGenerateRoadmap={handleGenerateRoadmap}
                onToggleStep={handleToggleRoadmapStep}
              />
            )}

            {section === 'interview' && (
              <InterviewPrepView
                sessions={interviews}
                activeResume={activeResume}
                targetRole={targetRole}
                onGenerateQuestions={handleGenerateInterviewQuestions}
                onEvaluateAnswer={handleEvaluateInterview}
                onDeleteSession={handleDeleteInterview}
              />
            )}
          </main>
        </div>
      )}

      {/* Privacy Deletion Confirmation Modal */}
      {confirmWipeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Delete All Saved Data?
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              This will permanently remove all uploaded resume analyses, saved job descriptions,
              skill gap items, career roadmaps, and interview practice records from your account.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={wiping}
                onClick={() => setConfirmWipeOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={wiping}
                onClick={() => void handleConfirmWipeAllData()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {wiping && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function handleGenerateSkillGapWrapper(skills: string[], role: TargetRole) {
    await handleGenerateSkillGaps(skills, role);
  }
}
