import React from 'react';
import { DayStats } from '../types/schedule';
import { formatDuration } from '../utils/scheduler';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Trash2 } from 'lucide-react';

interface CapacityStripProps {
  stats: DayStats;
  onRebalanceFromNow: () => void;
  onClearSchedule: () => void;
}

export const CapacityStrip: React.FC<CapacityStripProps> = ({
  stats,
  onRebalanceFromNow,
  onClearSchedule,
}) => {
  const isOverloaded = stats.overCapacityMinutes > 0;
  const utilizationPercent = Math.min(
    150,
    Math.round((stats.scheduledMinutes / (stats.availableMinutes || 1)) * 100)
  );

  return (
    <div className="bg-[#0D121F] border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left: Capacity Metrics & Progress Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto">
          
          {/* Planned vs Available Time */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-800/80 flex items-center justify-center text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Daily Capacity
              </div>
              <div className="text-sm font-semibold text-slate-200 font-mono tabular-nums">
                {formatDuration(stats.scheduledMinutes)}{' '}
                <span className="text-slate-500 font-normal">/ {formatDuration(stats.availableMinutes)}</span>
              </div>
            </div>
          </div>

          {/* Mini Capacity Bar */}
          <div className="hidden sm:block w-36">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>Load</span>
              <span className={isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {utilizationPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverloaded
                    ? 'bg-rose-500'
                    : utilizationPercent > 85
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, utilizationPercent)}%` }}
              />
            </div>
          </div>

          {/* Completion Count */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-800/80 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Progress
              </div>
              <div className="text-sm font-semibold text-slate-200 font-mono tabular-nums">
                {stats.completedTasks}{' '}
                <span className="text-slate-500 font-normal">/ {stats.totalTasks} completed</span>
              </div>
            </div>
          </div>

          {/* Priority Count Distribution */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>P1: {stats.p1Count}</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>P2: {stats.p2Count}</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>P3: {stats.p3Count}</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>P4: {stats.p4Count}</span>
            </span>
          </div>

        </div>

        {/* Right: Quick Alert or Rebalance Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {isOverloaded && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-800/50">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Overcommitted by {formatDuration(stats.overCapacityMinutes)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onRebalanceFromNow}
              title="Shifts upcoming uncompleted tasks starting from current time forward"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Rebalance From Now</span>
            </button>

            <button
              onClick={onClearSchedule}
              title="Unschedule all dynamic tasks (keeps fixed events)"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
