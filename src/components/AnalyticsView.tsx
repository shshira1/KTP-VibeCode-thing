import React from 'react';
import { Task, ScheduleConfig, DayStats } from '../types/schedule';
import { formatDuration } from '../utils/scheduler';
import { Clock, Flame, Activity, Coffee, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  config: ScheduleConfig;
  stats: DayStats;
  onAutoSchedule: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  config,
  stats,
  onAutoSchedule,
}) => {
  // Energy minutes breakdown
  const highEnergyMins = tasks
    .filter(t => t.energyLevel === 'high')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const mediumEnergyMins = tasks
    .filter(t => t.energyLevel === 'medium')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const lowEnergyMins = tasks
    .filter(t => t.energyLevel === 'low')
    .reduce((sum, t) => sum + t.durationMinutes, 0);

  const totalMins = highEnergyMins + mediumEnergyMins + lowEnergyMins || 1;

  const highPct = Math.round((highEnergyMins / totalMins) * 100);
  const medPct = Math.round((mediumEnergyMins / totalMins) * 100);
  const lowPct = Math.round((lowEnergyMins / totalMins) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090D16] text-slate-100 space-y-6">
      
      {/* View Header */}
      <div className="max-w-5xl mx-auto space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Day Capacity & Cognitive Load Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Understand how priority rankings translate into achievable, sustainable productivity throughout your day.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Schedule Completeness & Capacity */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Capacity Budget
            </span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatDuration(stats.scheduledMinutes)}{' '}
              <span className="text-xs font-normal text-slate-400">/ {formatDuration(stats.availableMinutes)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.overCapacityMinutes > 0
                ? `Exceeding available time by ${formatDuration(stats.overCapacityMinutes)}.`
                : `Safe buffer of ${formatDuration(stats.freeMinutes)} remaining.`}
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                stats.overCapacityMinutes > 0 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round((stats.scheduledMinutes / stats.availableMinutes) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Priority Distribution */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Priority Ranking
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40">
              <div className="text-xs text-rose-400 font-bold">P1</div>
              <div className="text-sm font-semibold text-white mt-0.5">{stats.p1Count}</div>
            </div>
            <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40">
              <div className="text-xs text-amber-400 font-bold">P2</div>
              <div className="text-sm font-semibold text-white mt-0.5">{stats.p2Count}</div>
            </div>
            <div className="p-2 rounded bg-indigo-950/30 border border-indigo-900/40">
              <div className="text-xs text-indigo-400 font-bold">P3</div>
              <div className="text-sm font-semibold text-white mt-0.5">{stats.p3Count}</div>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/40">
              <div className="text-xs text-slate-400 font-bold">P4</div>
              <div className="text-sm font-semibold text-white mt-0.5">{stats.p4Count}</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            P1 items are automatically scheduled into high-energy morning focus slots.
          </p>
        </div>

        {/* Metric 3: Completion Velocity */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.completionRate}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.completedTasks} of {stats.totalTasks} tasks finished today.
            </p>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

      </div>

      {/* Energy Curve & Workload Breakdown */}
      <div className="max-w-5xl mx-auto p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Cognitive Energy Allocation</span>
        </h3>

        {/* Energy breakdown bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Deep Work / High Focus</span>
              </span>
              <span>{formatDuration(highEnergyMins)} ({highPct}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${highPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Steady Execution</span>
              </span>
              <span>{formatDuration(mediumEnergyMins)} ({medPct}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${medPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-slate-400" />
                <span>Low Focus / Routine Admin</span>
              </span>
              <span>{formatDuration(lowEnergyMins)} ({lowPct}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-500" style={{ width: `${lowPct}%` }} />
            </div>
          </div>
        </div>

        {/* Methodology explanation */}
        <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
          <span className="font-semibold text-slate-300">How ChronoFocus Prioritizes:</span>
          <p>
            Unlike static to-do lists that treat all items equally, ChronoFocus calculates available gaps between fixed meetings and lunch, sorting non-fixed tasks by priority weight (P1 &gt; P2 &gt; P3 &gt; P4) and inserting configured {config.bufferMinutes}-minute rest buffers. This creates a realistic day that prevents cognitive overload and late-afternoon burnout.
          </p>
        </div>
      </div>

    </div>
  );
};
