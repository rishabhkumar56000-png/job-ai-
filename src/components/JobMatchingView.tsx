import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { JobMatch, ResumeAnalysis } from '../types/career';
import { DEMO_JOB_DESCRIPTION } from '../data/demoData';
import { BreakdownProgressBars, RadialScoreGauge } from './Charts';

interface JobMatchingViewProps {
  activeResume: ResumeAnalysis | null;
  jobMatches: JobMatch[];
  activeMatch: JobMatch | null;
  onSelectMatch: (match: JobMatch) => void;
  onSaveMatch: (
    match: Omit<JobMatch, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
  ) => Promise<void>;
  onDeleteMatch: (matchId: string) => Promise<void>;
  onSendMissingToGaps: (missingSkills: string[]) => Promise<void>;
  onGoToAnalyzer: () => void;
}

export function JobMatchingView({
  activeResume,
  jobMatches,
  activeMatch,
  onSelectMatch,
  onSaveMatch,
  onDeleteMatch,
  onSendMissingToGaps,
  onGoToAnalyzer,
}: JobMatchingViewProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matching, setMatching] = useState(false);
  const [sendingGaps, setSendingGaps] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoadSampleJob = () => {
    setJobTitle('Junior AI/ML Engineer');
    setCompanyName('Meridian Health Analytics (Demo)');
    setJobDescription(DEMO_JOB_DESCRIPTION);
    setErrorMsg(null);
  };

  const handleCompareJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeResume) {
      setErrorMsg('Please analyze or load a resume first before matching against a job description.');
      return;
    }
    if (jobDescription.trim().length < 25) {
      setErrorMsg('Please paste a job description of at least 25 characters.');
      return;
    }

    setMatching(true);
    try {
      const resumeSkills = [
        ...activeResume.programmingSkills,
        ...activeResume.technicalSkills,
        ...activeResume.softSkills,
      ];
      const res = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeSkills,
          resumeSummary: activeResume.summary,
          jobTitle: jobTitle.trim() || 'Target Role',
          companyName: companyName.trim() || 'Target Employer',
          jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compute compatibility score.');
      }

      await onSaveMatch({
        resumeId: activeResume.id,
        jobTitle: jobTitle.trim() || 'Target Role',
        companyName: companyName.trim() || 'Target Employer',
        jobDescription: jobDescription.trim(),
        compatibilityScore: Number(data.compatibilityScore) || 0,
        matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills : [],
        missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
        scoreExplanation: data.scoreExplanation || '',
        scoreBreakdown: Array.isArray(data.scoreBreakdown) ? data.scoreBreakdown : [],
        isDemo: false,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Job matching failed.');
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Job Matching</h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare your verified resume skills against any job description with an explainable point breakdown.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadSampleJob}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap self-start"
        >
          Fill Demo Job Posting
        </button>
      </div>

      {!activeResume && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />
            <span>
              No active resume selected. Upload or load a demo resume in the Resume Analyzer to unlock
              job compatibility scoring.
            </span>
          </div>
          <button
            type="button"
            onClick={onGoToAnalyzer}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer whitespace-nowrap"
          >
            Go to Resume Analyzer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Input Form & Saved Matches */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={(e) => void handleCompareJob(e)}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Target Job Description</h2>
              {activeResume && (
                <span className="text-xs text-slate-500 truncate max-w-[170px]">
                  Using: {activeResume.fileName}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Data Analyst Intern"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Labs"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste Full Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                placeholder="Paste required skills, responsibilities, and qualifications from the job listing..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={matching || !activeResume}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating Compatibility...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  Compare Resume &amp; Score Match
                </>
              )}
            </button>
          </form>

          {/* Saved Job Matches History */}
          {jobMatches.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Saved Job Comparisons</h3>
                <span className="text-xs text-slate-500 tabular-nums">{jobMatches.length} saved</span>
              </div>
              <div className="divide-y divide-slate-100">
                {jobMatches.map((m) => {
                  const selected = activeMatch?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`py-2.5 px-3 rounded-lg flex items-center justify-between gap-3 ${
                        selected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectMatch(m)}
                        className="text-left min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {m.jobTitle}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="truncate">{m.companyName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-blue-700 tabular-nums">
                            {m.compatibilityScore}%
                          </span>
                        </div>
                      </button>
                      {!m.isDemo && (
                        <button
                          type="button"
                          onClick={() => void onDeleteMatch(m.id)}
                          aria-label={`Delete ${m.jobTitle}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 7 Columns: Explainable Compatibility Results */}
        <div className="lg:col-span-7 space-y-6">
          {!activeMatch ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900">No job comparison yet</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Paste a job description on the left or click &ldquo;Fill Demo Job Posting&rdquo; to see an
                explainable compatibility breakdown.
              </p>
            </div>
          ) : (
            <>
              {/* Score Overview Card */}
              <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-7">
                <RadialScoreGauge
                  score={activeMatch.compatibilityScore}
                  label="Alignment"
                  size={150}
                  dark
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs font-medium text-blue-300 mb-1">
                    {activeMatch.isDemo ? 'Demo Job Match Result' : 'Explainable Compatibility Report'}
                  </div>
                  <h2 className="text-xl font-bold text-white">{activeMatch.jobTitle}</h2>
                  <p className="text-xs text-slate-400 mb-3">{activeMatch.companyName}</p>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {activeMatch.scoreExplanation}
                  </p>
                </div>
              </div>

              {/* Advisory Notice */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Alignment Estimate:</strong> Compatibility scores measure overlap
                  between evidenced resume skills and job description requirements. Scores are for
                  career preparation and never guarantee interviews or employment.
                </span>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matched Skills
                    </span>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {activeMatch.matchedSkills.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.matchedSkills.length > 0 ? (
                      activeMatch.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50/70 text-xs font-medium text-emerald-900"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No direct matches detected.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Missing Skills
                      </span>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {activeMatch.missingSkills.length}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {activeMatch.missingSkills.length > 0 ? (
                        activeMatch.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-md border border-rose-200 bg-rose-50/70 text-xs font-medium text-rose-900"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">All key job requirements matched.</p>
                      )}
                    </div>
                  </div>
                  {activeMatch.missingSkills.length > 0 && (
                    <button
                      type="button"
                      disabled={sendingGaps}
                      onClick={async () => {
                        setSendingGaps(true);
                        try {
                          await onSendMissingToGaps(activeMatch.missingSkills);
                        } finally {
                          setSendingGaps(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50"
                    >
                      {sendingGaps ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Building Improvement Plan...
                        </>
                      ) : (
                        <>
                          Send Missing Skills to Gap Analyzer
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Weighted Point Calculation Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  How the Compatibility Score Was Calculated
                </h3>
                <BreakdownProgressBars items={activeMatch.scoreBreakdown} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
