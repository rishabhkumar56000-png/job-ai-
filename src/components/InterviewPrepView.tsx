import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquareCode,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  InterviewSession,
  ResumeAnalysis,
  TARGET_ROLES,
  TargetRole,
} from '../types/career';

interface InterviewPrepViewProps {
  sessions: InterviewSession[];
  activeResume: ResumeAnalysis | null;
  targetRole: TargetRole;
  onGenerateQuestions: (role: TargetRole, category: 'technical' | 'hr', skills: string[]) => Promise<void>;
  onEvaluateAnswer: (session: InterviewSession, userAnswer: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export function InterviewPrepView({
  sessions,
  activeResume,
  targetRole,
  onGenerateQuestions,
  onEvaluateAnswer,
  onDeleteSession,
}: InterviewPrepViewProps) {
  const [selectedRole, setSelectedRole] = useState<TargetRole>(targetRole);
  const [category, setCategory] = useState<'technical' | 'hr'>('technical');
  const [activeId, setActiveId] = useState<string | null>(sessions[0]?.id || null);
  const [draftAnswer, setDraftAnswer] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredSessions = sessions.filter((s) => s.category === category);
  const currentSession =
    filteredSessions.find((s) => s.id === activeId) || filteredSessions[0] || null;

  const handleGenerate = async () => {
    setErrorMsg(null);
    setGenerating(true);
    try {
      const skills = activeResume
        ? [...activeResume.programmingSkills, ...activeResume.technicalSkills]
        : [];
      await onGenerateQuestions(selectedRole, category, skills);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;
    setErrorMsg(null);
    if (draftAnswer.trim().length < 15) {
      setErrorMsg('Write an answer of at least 15 characters before requesting AI feedback.');
      return;
    }

    setEvaluating(true);
    try {
      await onEvaluateAnswer(currentSession, draftAnswer.trim());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to evaluate your response.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Interview Preparation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Practice technical and HR questions tailored to your role, study sample benchmarks, and receive AI feedback.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setCategory('technical');
                setShowSample(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                category === 'technical'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Technical Questions
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory('hr');
                setShowSample(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                category === 'hr'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HR &amp; Behavioral
            </button>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as TargetRole)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            {TARGET_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={generating}
          onClick={() => void handleGenerate()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate 3 {category === 'hr' ? 'HR' : 'Technical'} Questions
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <MessageSquareCode className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No {category === 'hr' ? 'HR' : 'technical'} questions generated yet
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Click the button above to generate tailored interview questions and sample answers for{' '}
            {selectedRole}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 divide-y divide-slate-100">
            {filteredSessions.map((s, idx) => {
              const isSelected = currentSession?.id === s.id;
              const isDemo = s.id.startsWith('demo_');
              return (
                <div
                  key={s.id}
                  className={`py-3 px-3 rounded-lg flex items-start justify-between gap-2 ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(s.id);
                      setDraftAnswer(s.userAnswer || '');
                      setShowSample(false);
                      setErrorMsg(null);
                    }}
                    className="text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-mono">Q{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.targetRole}</span>
                      {s.score > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                            {s.score}/100
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{s.question}</p>
                  </button>
                  {!isDemo && (
                    <button
                      type="button"
                      onClick={() => void onDeleteSession(s.id)}
                      aria-label="Delete interview question"
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Practice Workspace */}
          {currentSession && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                  <span>
                    {currentSession.category === 'hr' ? 'HR / Behavioral' : 'Technical'} Question ·{' '}
                    {currentSession.targetRole}
                  </span>
                  {currentSession.id.startsWith('demo_') && <span>Demo Sample</span>}
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  {currentSession.question}
                </h2>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSample((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-white cursor-pointer"
                  >
                    {showSample ? (
                      <>
                        Hide Sample Answer
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View Sample Answer Benchmark
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {showSample && (
                    <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                      {currentSession.sampleAnswer}
                    </p>
                  )}
                </div>
              </div>

              <form
                onSubmit={(e) => void handleEvaluate(e)}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900">Your Practice Response</label>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {draftAnswer.length} chars
                  </span>
                </div>
                <textarea
                  value={draftAnswer}
                  onChange={(e) => setDraftAnswer(e.target.value)}
                  rows={6}
                  placeholder="Write your structured answer here (tip: explain the context, technical trade-offs, and measurable outcome)..."
                  className="w-full rounded-lg border border-slate-300 p-3.5 text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={evaluating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating Answer...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for AI Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>

              {currentSession.aiFeedback && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">AI Coaching Evaluation</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evaluated on clarity, accuracy, and structure
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
                        {currentSession.score}/100
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {currentSession.aiFeedback}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        What Worked Well
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {currentSession.strengths.map((st, i) => (
                          <li key={i}>• {st}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        How to Strengthen
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {currentSession.improvements.map((im, i) => (
                          <li key={i}>• {im}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
