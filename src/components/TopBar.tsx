import React from 'react';
import { Calendar, Zap, Plus, Settings, Sparkles } from 'lucide-react';

interface TopBarProps {
  activeTab: 'day' | 'backlog' | 'analytics';
  onTabChange: (tab: 'day' | 'backlog' | 'analytics') => void;
  onAutoSchedule: () => void;
  onNewTask: () => void;
  onOpenSettings: () => void;
  onOpenAIAssistant: () => void;
  isOverCapacity?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onAutoSchedule,
  onNewTask,
  onOpenSettings,
  onOpenAIAssistant,
  isOverCapacity,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand wordmark & Date */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              ChronoFocus
              <span className="text-xs font-normal text-slate-400 font-mono tracking-normal">
                {todayFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation views */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onTabChange('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'day'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Day Timeline
          </button>
          <button
            onClick={() => onTabChange('backlog')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'backlog'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Priority Backlog
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacity & Energy
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenAIAssistant}
            title="AI Schedule Analysis"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Advice</span>
          </button>

          <button
            onClick={onAutoSchedule}
            title="Auto-arrange tasks into the calendar by priority & energy"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Auto-Schedule</span>
          </button>

          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Working Hours & Buffers"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
