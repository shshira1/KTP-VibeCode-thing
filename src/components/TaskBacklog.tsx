import React, { useState, useMemo } from 'react';
import { Task, Priority, EnergyLevel } from '../types/schedule';
import { formatDuration, formatTimeDisplay } from '../utils/scheduler';
import {
  Check,
  Clock,
  Zap,
  Calendar,
  Trash2,
  Edit2,
  Search,
  Plus,
  Flame,
  Coffee,
  Activity,
  CalendarCheck,
  CalendarX,
  Lock,
  GripVertical,
} from 'lucide-react';

interface TaskBacklogProps {
  tasks: Task[];
  placingTaskId?: string | null;
  onToggleComplete: (taskId: string) => void;
  onScheduleNextSlot: (taskId: string) => void;
  onUnschedule: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onChangePriority: (taskId: string, newPriority: Priority) => void;
  onSelectTaskToPlace?: (taskId: string | null) => void;
}

export const TaskBacklog: React.FC<TaskBacklogProps> = ({
  tasks,
  placingTaskId,
  onToggleComplete,
  onScheduleNextSlot,
  onUnschedule,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
  onChangePriority,
  onSelectTaskToPlace,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Priority>('ALL');
  const [energyFilter, setEnergyFilter] = useState<'ALL' | EnergyLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'unscheduled' | 'scheduled' | 'completed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
      if (energyFilter !== 'ALL' && task.energyLevel !== energyFilter) return false;
      if (statusFilter === 'unscheduled' && (task.scheduledStart || task.isCompleted)) return false;
      if (statusFilter === 'scheduled' && (!task.scheduledStart || task.isCompleted)) return false;
      if (statusFilter === 'completed' && !task.isCompleted) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesCategory) return false;
      }
      return true;
    });
  }, [tasks, priorityFilter, energyFilter, statusFilter, searchQuery]);

  // Group by priority
  const priorityGroups: { key: Priority; label: string; desc: string; color: string }[] = [
    { key: 'P1', label: 'Priority 1 · Urgent & Critical', desc: 'Peak focus required; schedule early', color: 'rose' },
    { key: 'P2', label: 'Priority 2 · High Leverage', desc: 'Core execution and project deliverables', color: 'amber' },
    { key: 'P3', label: 'Priority 3 · Medium & Routine', desc: 'Maintenance, updates, and reviews', color: 'indigo' },
    { key: 'P4', label: 'Priority 4 · Low / Buffer', desc: 'Quick admin, backlog cleanup', color: 'slate' },
  ];

  const getEnergyBadge = (level: EnergyLevel) => {
    switch (level) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-300">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>High Focus</span>
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>Medium</span>
          </span>
        );
      case 'low':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Coffee className="w-3 h-3 text-slate-400" />
            <span>Low / Admin</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] text-slate-100">
      
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-3 bg-[#0D121F]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Prioritized Task Backlog
            </h2>
            <p className="text-xs text-slate-400">
              Tasks ranked by urgency and energy requirement for optimal daily time-blocking
            </p>
          </div>
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks, categories, or notes..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
        </div>

        {/* Segmented Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Priority filter */}
          <div className="flex items-center bg-slate-900/90 rounded-md p-0.5 border border-slate-800">
            {(['ALL', 'P1', 'P2', 'P3', 'P4'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  priorityFilter === p
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center bg-slate-900/90 rounded-md p-0.5 border border-slate-800">
            {(['ALL', 'unscheduled', 'scheduled', 'completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-300">No tasks match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your priority or search terms, or add a new task to your backlog.
            </p>
            <button
              onClick={onOpenNewTaskModal}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-md transition-colors"
            >
              + Create First Task
            </button>
          </div>
        ) : (
          priorityGroups.map(group => {
            const groupTasks = filteredTasks.filter(t => t.priority === group.key);
            if (priorityFilter !== 'ALL' && priorityFilter !== group.key) return null;
            if (groupTasks.length === 0 && priorityFilter === 'ALL') return null;

            return (
              <div key={group.key} className="space-y-2.5">
                
                {/* Group Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        group.key === 'P1'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : group.key === 'P2'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : group.key === 'P3'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {group.key}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {group.label.split('·')[1]?.trim() || group.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({groupTasks.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {group.desc}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-2">
                  {groupTasks.map(task => {
                    const isScheduled = !!(task.scheduledStart && task.scheduledEnd);

                    const isPlacingThis = placingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={!task.isCompleted}
                        onDragStart={e => {
                          try {
                            if (typeof window !== 'undefined') {
                              (window as any).__CHRONO_DRAG_TASK_ID__ = task.id;
                              window.dispatchEvent(new CustomEvent('chrono-drag-start', { detail: { taskId: task.id } }));
                            }
                            e.dataTransfer.setData('text/plain', task.id);
                            e.dataTransfer.setData('text', task.id);
                            e.dataTransfer.effectAllowed = 'move';
                          } catch (err) {
                            console.warn('Drag start err', err);
                          }
                        }}
                        onDragEnd={() => {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('chrono-drag-end'));
                            setTimeout(() => {
                              (window as any).__CHRONO_DRAG_TASK_ID__ = null;
                            }, 300);
                          }
                        }}
                        className={`group relative rounded-lg border transition-all duration-150 p-3 select-none ${
                          isPlacingThis
                            ? 'ring-2 ring-indigo-500 bg-indigo-950/30 border-indigo-500/80 shadow-lg'
                            : task.isCompleted
                            ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                            : isScheduled
                            ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 shadow-sm cursor-grab active:cursor-grabbing'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/40 cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          
                          {/* Drag Handle */}
                          {!task.isCompleted && (
                            <div
                              title="Drag onto calendar timeline"
                              className="mt-0.5 text-slate-500 group-hover:text-indigo-400 cursor-grab active:cursor-grabbing shrink-0"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                          )}

                          {/* Complete Checkbox */}
                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                              task.isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-700 hover:border-slate-500 bg-slate-800/50'
                            }`}
                          >
                            {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={`text-xs font-medium leading-snug break-words ${
                                  task.isCompleted
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-200 group-hover:text-white'
                                }`}
                              >
                                {task.title}
                              </h4>

                              {/* Priority Selector Pill */}
                              <select
                                value={task.priority}
                                onChange={e => onChangePriority(task.id, e.target.value as Priority)}
                                className="text-[10px] font-mono font-bold bg-slate-800/90 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 hover:text-white cursor-pointer focus:outline-none"
                              >
                                <option value="P1">P1</option>
                                <option value="P2">P2</option>
                                <option value="P3">P3</option>
                                <option value="P4">P4</option>
                              </select>
                            </div>

                            {task.notes && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                {task.notes}
                              </p>
                            )}

                            {/* Metadata Strip: Duration, Energy, Category, Schedule Status */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-slate-400 font-mono">
                              
                              {/* Duration */}
                              <span className="flex items-center gap-1 text-slate-300">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{formatDuration(task.durationMinutes)}</span>
                              </span>

                              <span className="text-slate-700">·</span>

                              {/* Energy Level */}
                              {getEnergyBadge(task.energyLevel)}

                              {task.category && (
                                <>
                                  <span className="text-slate-700">·</span>
                                  <span className="text-slate-400">{task.category}</span>
                                </>
                              )}

                              {/* Fixed Commitment indicator */}
                              {task.isFixedTime && (
                                <>
                                  <span className="text-slate-700">·</span>
                                  <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                                    <Lock className="w-3 h-3" />
                                    <span>Fixed Commitment</span>
                                  </span>
                                </>
                              )}

                              {/* Schedule Status */}
                              <span className="text-slate-700">·</span>
                              {isScheduled ? (
                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                  <CalendarCheck className="w-3 h-3" />
                                  <span>
                                    {formatTimeDisplay(task.scheduledStart!)} – {formatTimeDisplay(task.scheduledEnd!)}
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <CalendarX className="w-3 h-3" />
                                  <span>Unscheduled</span>
                                </span>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                          {/* Schedule / Unschedule Toggle */}
                          {!task.isFixedTime && (
                            isScheduled ? (
                              <button
                                onClick={() => onUnschedule(task.id)}
                                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                              >
                                <span>Unschedule</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                {onSelectTaskToPlace && (
                                  <button
                                    onClick={() => onSelectTaskToPlace(isPlacingThis ? null : task.id)}
                                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded border transition-colors ${
                                      isPlacingThis
                                        ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                                        : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800/50'
                                    }`}
                                  >
                                    <span>{isPlacingThis ? 'Cancel Placing' : 'Place on Slot'}</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => onScheduleNextSlot(task.id)}
                                  title="Auto-slots into earliest available gap"
                                  className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
                                >
                                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span>Auto-Fit</span>
                                </button>
                              </div>
                            )
                          )}

                          <button
                            onClick={() => onEditTask(task)}
                            title="Edit Task"
                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete Task"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
