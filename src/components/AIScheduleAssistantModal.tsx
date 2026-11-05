import React from 'react';
import { Task, ScheduleConfig, DayStats } from '../types/schedule';
import { formatDuration } from '../utils/scheduler';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb, BatteryCharging } from 'lucide-react';

interface AIScheduleAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  config: ScheduleConfig;
  stats: DayStats;
  onAutoSchedule: () => void;
  onPostponeP4: () => void;
}

export const AIScheduleAssistantModal: React.FC<AIScheduleAssistantModalProps> = ({
  isOpen,
  onClose,
  tasks,
  config,
  stats,
  onAutoSchedule,
  onPostponeP4,
}) => {
  if (!isOpen) return null;

  const isOverloaded = stats.overCapacityMinutes > 0;
  const p1Tasks = tasks.filter(t => t.priority === 'P1');
  const highEnergyTasks = tasks.filter(t => t.energyLevel === 'high');
  const unscheduledCount = tasks.filter(t => !t.scheduledStart && !t.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Daily Strategy & Schedule Intelligence
              </h3>
              <p className="text-[11px] text-slate-400">
                Cognitive load analysis and energy-aligned execution advice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Insights */}
        <div className="space-y-3">
          
          {/* Overload status banner */}
          {isOverloaded ? (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/50 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-rose-300">
                  Day is Overcommitted by {formatDuration(stats.overCapacityMinutes)}
                </div>
                <div className="text-slate-400 mt-0.5">
                  You have planned {formatDuration(stats.scheduledMinutes)} of tasks against {formatDuration(stats.availableMinutes)} of available work hours. Consider deferring P4 or low-priority tasks to guarantee completion of P1 items.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-emerald-300">
                  Achievable & Balanced Workload
                </div>
                <div className="text-slate-400 mt-0.5">
                  Your day timeline has {formatDuration(stats.freeMinutes)} of breathing room buffer. This schedule is realistic and protects against unexpected interruptions.
                </div>
              </div>
            </div>
          )}

          {/* 3 Strategic Recommendations */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Tactical Sequence</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2.5">
              
              {/* Insight 1: Morning Deep Work */}
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                  1
                </span>
                <div>
                  <span className="font-medium text-slate-200">
                    Front-load P1 High Focus tasks:
                  </span>{' '}
                  <span className="text-slate-400">
                    {p1Tasks.length > 0
                      ? `Tackle "${p1Tasks[0].title}" in your morning 8:00 AM – 11:30 AM peak mental clarity window.`
                      : 'You currently have no P1 tasks queued. Promote top priority items to focus your energy.'}
                  </span>
                </div>
              </div>

              {/* Insight 2: Energy curve preservation */}
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                  2
                </span>
                <div>
                  <span className="font-medium text-slate-200">
                    Preserve the 12:00 PM – 1:00 PM Lunch & Recharge boundary:
                  </span>{' '}
                  <span className="text-slate-400">
                    Stepping away prevents the 2:00 PM cognitive slump and ensures afternoon steady execution runs smoothly.
                  </span>
                </div>
              </div>

              {/* Insight 3: Unscheduled tasks */}
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                  3
                </span>
                <div>
                  <span className="font-medium text-slate-200">
                    {unscheduledCount > 0
                      ? `${unscheduledCount} tasks remain unscheduled in your backlog.`
                      : 'All non-completed tasks are slotted into your timeline.'}
                  </span>{' '}
                  <span className="text-slate-400">
                    {unscheduledCount > 0
                      ? 'Click Auto-Schedule to slot them into optimal available gaps.'
                      : 'You are ready to begin execution.'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800">
          {stats.p4Count > 0 && isOverloaded ? (
            <button
              onClick={() => {
                onPostponeP4();
                onClose();
              }}
              className="w-full sm:w-auto text-xs font-medium text-amber-400 hover:text-amber-300 py-1.5 transition-colors"
            >
              Postpone P4 Tasks
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onAutoSchedule();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <span>Apply Auto-Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
