import { motion } from 'motion/react';
import type { ScoreBreakdownItem } from '../types/career';

export function RadialScoreGauge({
  score,
  label,
  size = 152,
  dark = false,
}: {
  score: number;
  label: string;
  size?: number;
  dark?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${clamped}%`}>
        <defs>
          <linearGradient id="jobmatchScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dark ? '#1E293B' : '#E2E8F0'}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#jobmatchScoreGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`text-3xl font-bold tracking-tight tabular-nums ${
            dark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {clamped}%
        </span>
        <span className={`text-xs font-medium mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function SkillCategoryChart({
  programmingCount,
  technicalCount,
  softCount,
}: {
  programmingCount: number;
  technicalCount: number;
  softCount: number;
}) {
  const maxVal = Math.max(programmingCount, technicalCount, softCount, 1);
  const rows = [
    { label: 'Programming Languages', count: programmingCount, color: 'from-blue-600 to-blue-500' },
    { label: 'Technical & AI Stack', count: technicalCount, color: 'from-indigo-600 to-violet-600' },
    { label: 'Soft & Professional Skills', count: softCount, color: 'from-slate-700 to-slate-600' },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const pct = Math.round((row.count / maxVal) * 100);
        return (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700">{row.label}</span>
              <span className="font-mono text-slate-900 tabular-nums">{row.count} detected</span>
            </div>
            <div className="h-2.5 w-full rounded-sm bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${row.color} rounded-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(row.count > 0 ? 8 : 0, pct)}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BreakdownProgressBars({ items }: { items: ScoreBreakdownItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const pct = item.max > 0 ? Math.min(100, Math.round((item.earned / item.max) * 100)) : 0;
        return (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-slate-900">{item.category}</span>
              <span className="text-xs font-mono font-medium text-slate-700 tabular-nums shrink-0">
                {item.earned} / {item.max} pts
              </span>
            </div>
            <div className="h-2 w-full rounded-sm bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{item.rationale}</p>
          </div>
        );
      })}
    </div>
  );
}
