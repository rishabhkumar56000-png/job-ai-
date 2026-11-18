import { useState } from 'react';
import {
  AlertCircle,
  CheckSquare,
  Compass,
  FolderGit2,
  Loader2,
  Sparkles,
  Square,
} from 'lucide-react';
import {
  CareerRoadmap,
  ResumeAnalysis,
  TARGET_ROLES,
  TargetRole,
} from '../types/career';
import { RadialScoreGauge } from './Charts';

interface RoadmapViewProps {
  roadmaps: CareerRoadmap[];
  activeRoadmap: CareerRoadmap | null;
  activeResume: ResumeAnalysis | null;
  targetRole: TargetRole;
  onSelectRoadmap: (roadmap: CareerRoadmap) => void;
  onGenerateRoadmap: (role: TargetRole, currentSkills: string[]) => Promise<void>;
  onToggleStep: (roadmapId: string, stepId: string) => Promise<void>;
}

export function RoadmapView({
  roadmaps,
  activeRoadmap,
  activeResume,
  targetRole,
  onSelectRoadmap,
  onGenerateRoadmap,
  onToggleStep,
}: RoadmapViewProps) {
  const [selectedRole, setSelectedRole] = useState<TargetRole>(
    activeRoadmap?.targetRole || targetRole
  );
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (roleToGenerate: TargetRole) => {
    setErrorMsg(null);
    setSelectedRole(roleToGenerate);
    setGenerating(true);
    try {
      const skills = activeResume
        ? [
            ...activeResume.programmingSkills,
            ...activeResume.technicalSkills,
            ...activeResume.softSkills,
          ]
        : [];
      await onGenerateRoadmap(roleToGenerate, skills);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const completedStepsCount = activeRoadmap
    ? activeRoadmap.steps.filter((s) => activeRoadmap.completedStepIds.includes(s.stepId)).length
    : 0;
  const totalSteps = activeRoadmap ? activeRoadmap.steps.length : 0;
  const progressPct = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Personalized Career Roadmap
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Select a target engineering or data role to generate tailored learning phases, projects, and skill milestones.
          </p>
        </div>
      </div>

      {/* Role Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {TARGET_ROLES.map((role) => {
              const existing = roadmaps.find((r) => r.targetRole === role);
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    if (existing) onSelectRoadmap(existing);
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {role}
                  {existing ? ' ✓' : ''}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={() => void handleGenerate(selectedRole)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building {selectedRole} Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {selectedRole} Roadmap
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {!activeRoadmap ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">Select a career track to begin</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Choose any of the 6 supported roles above and click Generate to build a personalized roadmap
            adapted to your current resume skills.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roadmap Overview & Progress */}
          <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-7">
            <RadialScoreGauge score={progressPct} label="Progress" size={140} dark />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs font-medium text-blue-300 mb-1">
                {activeRoadmap.id.startsWith('demo_') ? 'Demo Career Roadmap' : 'Active Career Roadmap'}
              </div>
              <h2 className="text-xl font-bold text-white">{activeRoadmap.targetRole}</h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeRoadmap.overview}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <span className="tabular-nums">
                  {completedStepsCount} of {totalSteps} milestones completed
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {activeRoadmap.projectSuggestions.length} capstone projects
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Learning Steps Timeline */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-bold text-slate-900">Learning Milestones</h3>
              <div className="divide-y divide-slate-200">
                {activeRoadmap.steps.map((step) => {
                  const done = activeRoadmap.completedStepIds.includes(step.stepId);
                  return (
                    <div key={step.stepId} className="py-4 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => void onToggleStep(activeRoadmap.id, step.stepId)}
                        className="w-full flex items-start gap-3.5 text-left cursor-pointer group"
                      >
                        {done ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                            <span className="font-semibold text-blue-700">{step.phase}</span>
                            <span className="font-mono tabular-nums">{step.estimatedWeeks} weeks</span>
                          </div>
                          <h4
                            className={`text-sm font-bold ${
                              done ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {step.skillsCovered.map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Skills & Capstone Projects */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Recommended Core Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeRoadmap.recommendedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50/50 text-xs font-medium text-blue-900"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  Recommended Portfolio Projects
                </h3>
                <div className="divide-y divide-slate-100">
                  {activeRoadmap.projectSuggestions.map((proj, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{proj.title}</h4>
                        <span className="text-xs font-medium text-indigo-700 shrink-0">
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="text-[11px] font-medium text-slate-500 mt-2">
                        {proj.skillsApplied.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
