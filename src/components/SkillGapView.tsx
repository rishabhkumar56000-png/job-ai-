import { useState } from 'react';
import {
  AlertCircle,
  CheckSquare,
  Layers,
  Loader2,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import { SkillGapItem, TargetRole, TARGET_ROLES } from '../types/career';
import { RadialScoreGauge } from './Charts';

interface SkillGapViewProps {
  skillGaps: SkillGapItem[];
  targetRole: TargetRole;
  onGenerateSkillGaps: (skills: string[], role: TargetRole) => Promise<void>;
  onToggleCompleted: (skillId: string, completed: boolean) => Promise<void>;
  onDeleteSkillGap: (skillId: string) => Promise<void>;
}

export function SkillGapView({
  skillGaps,
  targetRole,
  onGenerateSkillGaps,
  onToggleCompleted,
  onDeleteSkillGap,
}: SkillGapViewProps) {
  const [customSkillsInput, setCustomSkillsInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<TargetRole>(targetRole);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const completedCount = skillGaps.filter((s) => s.completed).length;
  const completionPct =
    skillGaps.length > 0 ? Math.round((completedCount / skillGaps.length) * 100) : 0;

  const handleAddSkillsPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = customSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (parsed.length === 0) {
      setErrorMsg('Enter one or more comma-separated skills (e.g., Docker, PyTorch, SQL).');
      return;
    }

    setGenerating(true);
    try {
      await onGenerateSkillGaps(parsed, selectedRole);
      setCustomSkillsInput('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate learning topics.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Skill Gap Analyzer</h1>
        <p className="text-sm text-slate-600 mt-1">
          Identify skills that need improvement, review study topics, and track your completion checklist.
        </p>
      </div>

      {/* Progress & Add Skills Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#0F172A] text-white border border-slate-800 rounded-xl p-6 flex items-center gap-6">
          <RadialScoreGauge score={completionPct} label="Completed" size={124} dark />
          <div>
            <p className="text-xs font-medium text-blue-300">Checklist Progress</p>
            <div className="text-2xl font-bold tabular-nums mt-1">
              {completedCount} / {skillGaps.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Skills marked complete in your improvement tracker
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => void handleAddSkillsPlan(e)}
          className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-4"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Generate Learning Topics for Target Skills
            </h2>
            <p className="text-xs text-slate-500">
              Enter missing skills from a job match or skills you want to strengthen.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <input
                type="text"
                value={customSkillsInput}
                onChange={(e) => setCustomSkillsInput(e.target.value)}
                placeholder="e.g. PyTorch, Docker, System Design, SQL Indexing"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as TargetRole)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Checklist Items */}
      {skillGaps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">Your skill gap checklist is empty</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Add skills above or send missing skills directly from the AI Job Matching panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skillGaps.map((item) => {
            const isDemo = item.id.startsWith('demo_');
            return (
              <div
                key={item.id}
                className={`border rounded-xl p-5 transition-colors ${
                  item.completed
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => void onToggleCompleted(item.id, !item.completed)}
                    className="flex items-start gap-3 text-left cursor-pointer group flex-1"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3
                        className={`text-base font-bold ${
                          item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {item.skillName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="capitalize">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.priority === 'High'
                              ? 'text-rose-700 font-semibold'
                              : item.priority === 'Medium'
                                ? 'text-amber-700 font-semibold'
                                : 'text-blue-700 font-semibold'
                          }
                        >
                          {item.priority} Priority
                        </span>
                        {item.completed && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-semibold">Completed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {!isDemo && (
                    <button
                      type="button"
                      onClick={() => void onDeleteSkillGap(item.id)}
                      aria-label={`Remove ${item.skillName}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pl-8 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Suggested Learning Topics</div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {item.learningTopics.map((topic, idx) => (
                      <li key={idx}>• {topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
