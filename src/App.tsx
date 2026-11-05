/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Task, ScheduleConfig, Priority } from './types/schedule';
import {
  DEFAULT_CONFIG,
  INITIAL_SAMPLE_TASKS,
  autoScheduleTasks,
  calculateDayStats,
  timeToMinutes,
  minutesToTime,
  formatTimeDisplay,
} from './utils/scheduler';
import { TopBar } from './components/TopBar';
import { CapacityStrip } from './components/CapacityStrip';
import { TaskBacklog } from './components/TaskBacklog';
import { DayTimeline } from './components/DayTimeline';
import { AnalyticsView } from './components/AnalyticsView';
import { NewTaskModal } from './components/NewTaskModal';
import { SettingsModal } from './components/SettingsModal';
import { AIScheduleAssistantModal } from './components/AIScheduleAssistantModal';
import { RebalanceModal } from './components/RebalanceModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const TASKS_STORAGE_KEY = 'chronofocus_tasks_v1';
const CONFIG_STORAGE_KEY = 'chronofocus_config_v1';

export default function App() {
  // Config state
  const [config, setConfig] = useState<ScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SAMPLE_TASKS;
    } catch {
      return INITIAL_SAMPLE_TASKS;
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'day' | 'backlog' | 'analytics'>('day');

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [slotForNewTask, setSlotForNewTask] = useState<string | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [placingTaskId, setPlacingTaskId] = useState<string | null>(null);

  const placingTask = useMemo(
    () => tasks.find(t => t.id === placingTaskId) || null,
    [tasks, placingTaskId]
  );

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(curr => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  }, [config]);

  // Derived statistics
  const stats = useMemo(() => {
    return calculateDayStats(tasks, config);
  }, [tasks, config]);

  // Handler: Auto-schedule day
  const handleAutoSchedule = () => {
    const { scheduledTasks, unplacedTasks } = autoScheduleTasks(tasks, config);

    // Merge: scheduledTasks have times, unplaced have undefined times
    const updatedMap = new Map<string, Task>();
    scheduledTasks.forEach(t => updatedMap.set(t.id, t));
    unplacedTasks.forEach(t => updatedMap.set(t.id, t));

    const finalTasks = tasks.map(t => updatedMap.get(t.id) || t);
    setTasks(finalTasks);

    if (unplacedTasks.length > 0) {
      showToast(
        `Scheduled ${scheduledTasks.length} tasks. ${unplacedTasks.length} lower-priority items couldn't fit into available hours.`,
        'warn'
      );
    } else {
      showToast('All prioritized tasks successfully scheduled into optimal time blocks!', 'success');
    }
  };

  // Handler: Rebalance from specified time anchor (e.g. current time or preset)
  const handleConfirmRebalance = (timeStr: string) => {
    const startMins = timeToMinutes(timeStr);
    const { scheduledTasks, unplacedTasks } = autoScheduleTasks(tasks, config, startMins);

    const updatedMap = new Map<string, Task>();
    scheduledTasks.forEach(t => updatedMap.set(t.id, t));
    unplacedTasks.forEach(t => updatedMap.set(t.id, t));

    const finalTasks = tasks.map(t => updatedMap.get(t.id) || t);
    setTasks(finalTasks);

    if (unplacedTasks.length > 0) {
      showToast(
        `Rebalanced from ${timeStr}. ${unplacedTasks.length} lower-priority items couldn't fit in remaining time today.`,
        'warn'
      );
    } else {
      showToast(`Schedule rebalanced from ${timeStr} forward!`, 'success');
    }
  };

  // Handler: Clear all scheduled times (except fixed meetings)
  const handleClearSchedule = () => {
    setTasks(prev =>
      prev.map(t => (t.isFixedTime ? t : { ...t, scheduledStart: undefined, scheduledEnd: undefined }))
    );
    showToast('Dynamic schedule cleared. Backlog preserved.', 'info');
  };

  // Handler: Toggle Task Completion
  const handleToggleComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          return {
            ...t,
            isCompleted: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Handler: Schedule next single slot for task
  const handleScheduleNextSlot = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    // Run scheduler with only this task plus already scheduled ones
    const alreadyScheduled = tasks.filter(t => t.scheduledStart && t.scheduledEnd);
    const queue = [targetTask];

    const { scheduledTasks } = autoScheduleTasks([...alreadyScheduled, ...queue], config);
    const updatedTarget = scheduledTasks.find(t => t.id === taskId);

    if (updatedTarget?.scheduledStart) {
      setTasks(prev => prev.map(t => (t.id === taskId ? updatedTarget : t)));
      showToast(`Slotted "${targetTask.title}" at ${updatedTarget.scheduledStart}`, 'success');
    } else {
      showToast('No free slot large enough in today\'s work hours.', 'warn');
    }
  };

  // Handler: Unschedule single task
  const handleUnschedule = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, scheduledStart: undefined, scheduledEnd: undefined } : t))
    );
    showToast('Task moved back to backlog.', 'info');
  };

  // Handler: Nudge task time (+15m or -15m)
  const handleNudgeTask = (taskId: string, deltaMinutes: number) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.scheduledStart && t.scheduledEnd) {
          const startM = timeToMinutes(t.scheduledStart) + deltaMinutes;
          const endM = timeToMinutes(t.scheduledEnd) + deltaMinutes;
          if (startM >= 0 && endM <= 1440) {
            return {
              ...t,
              scheduledStart: minutesToTime(startM),
              scheduledEnd: minutesToTime(endM),
            };
          }
        }
        return t;
      })
    );
  };

  // Handler: Drop task directly into specific timeline start minute
  const handleDropTaskOnTimeline = (taskId: string, startMinutes: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const startStr = minutesToTime(startMinutes);
    const endMinutes = Math.min(1439, startMinutes + task.durationMinutes);
    const endStr = minutesToTime(endMinutes);

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              scheduledStart: startStr,
              scheduledEnd: endStr,
            }
          : t
      )
    );

    showToast(
      `Slotted "${task.title}" at ${formatTimeDisplay(startStr)} – ${formatTimeDisplay(endStr)}`,
      'success'
    );
  };

  // Handler: Save Task (add or update)
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit
      setTasks(prev => prev.map(t => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t)));
      showToast('Task updated successfully.');
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Untitled Task',
        notes: taskData.notes,
        category: taskData.category,
        priority: taskData.priority || 'P2',
        durationMinutes: taskData.durationMinutes || 45,
        energyLevel: taskData.energyLevel || 'medium',
        isFixedTime: taskData.isFixedTime || false,
        scheduledStart: taskData.scheduledStart,
        scheduledEnd: taskData.scheduledEnd,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      showToast(`Added "${newTask.title}" to backlog.`);
    }
  };

  // Handler: Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task deleted.', 'info');
  };

  // Handler: Quick priority change
  const handleChangePriority = (taskId: string, newPriority: Priority) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)));
    showToast(`Priority updated to ${newPriority}.`);
  };

  // Handler: Postpone P4 tasks to resolve over-capacity
  const handlePostponeP4 = () => {
    setTasks(prev =>
      prev.map(t => (t.priority === 'P4' ? { ...t, scheduledStart: undefined, scheduledEnd: undefined } : t))
    );
    showToast('Postponed P4 tasks to reserve time for urgent priorities.', 'info');
  };

  // Reset to realistic sample tasks
  const handleResetToSampleTasks = () => {
    setTasks(INITIAL_SAMPLE_TASKS);
    showToast('Loaded sample tasks with realistic priorities and schedule.');
  };

  // Clear all tasks
  const handleClearAllTasks = () => {
    setTasks([]);
    showToast('All tasks cleared.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar (Follows Top Bar Contract) */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAutoSchedule={handleAutoSchedule}
        onNewTask={() => {
          setEditingTask(null);
          setSlotForNewTask(undefined);
          setIsNewTaskModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        isOverCapacity={stats.overCapacityMinutes > 0}
      />

      {/* Capacity & Progress Strip */}
      <CapacityStrip
        stats={stats}
        onRebalanceFromNow={() => setIsRebalanceModalOpen(true)}
        onClearSchedule={handleClearSchedule}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Day Tab: Side-by-side on desktop, view switchable on mobile */}
        {activeTab === 'day' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Prioritized Backlog Sidebar */}
            <div className="w-full lg:w-[420px] shrink-0 border-r border-slate-800/80 flex flex-col h-1/2 lg:h-full">
              <TaskBacklog
                tasks={tasks}
                placingTaskId={placingTaskId}
                onSelectTaskToPlace={setPlacingTaskId}
                onToggleComplete={handleToggleComplete}
                onScheduleNextSlot={handleScheduleNextSlot}
                onUnschedule={handleUnschedule}
                onDeleteTask={handleDeleteTask}
                onEditTask={task => {
                  setEditingTask(task);
                  setIsNewTaskModalOpen(true);
                }}
                onOpenNewTaskModal={() => {
                  setEditingTask(null);
                  setSlotForNewTask(undefined);
                  setIsNewTaskModalOpen(true);
                }}
                onChangePriority={handleChangePriority}
              />
            </div>

            {/* Right: Continuous Day Timeline */}
            <div className="flex-1 flex flex-col h-1/2 lg:h-full overflow-hidden">
              <DayTimeline
                tasks={tasks}
                config={config}
                placingTask={placingTask}
                onCancelPlacing={() => setPlacingTaskId(null)}
                onToggleComplete={handleToggleComplete}
                onUnschedule={handleUnschedule}
                onNudgeTask={handleNudgeTask}
                onSelectSlotForNewTask={timeStr => {
                  setSlotForNewTask(timeStr);
                  setEditingTask(null);
                  setIsNewTaskModalOpen(true);
                }}
                onEditTask={task => {
                  setEditingTask(task);
                  setIsNewTaskModalOpen(true);
                }}
                onDropTask={(taskId, startMinutes) => {
                  handleDropTaskOnTimeline(taskId, startMinutes);
                  setPlacingTaskId(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Backlog Tab: Focused full-width backlog */}
        {activeTab === 'backlog' && (
          <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col overflow-hidden p-4 sm:p-6">
            <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden bg-[#0B0F17]">
              <TaskBacklog
                tasks={tasks}
                placingTaskId={placingTaskId}
                onSelectTaskToPlace={taskId => {
                  setPlacingTaskId(taskId);
                  if (taskId) setActiveTab('day');
                }}
                onToggleComplete={handleToggleComplete}
                onScheduleNextSlot={handleScheduleNextSlot}
                onUnschedule={handleUnschedule}
                onDeleteTask={handleDeleteTask}
                onEditTask={task => {
                  setEditingTask(task);
                  setIsNewTaskModalOpen(true);
                }}
                onOpenNewTaskModal={() => {
                  setEditingTask(null);
                  setSlotForNewTask(undefined);
                  setIsNewTaskModalOpen(true);
                }}
                onChangePriority={handleChangePriority}
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            config={config}
            stats={stats}
            onAutoSchedule={handleAutoSchedule}
          />
        )}

      </main>

      {/* Floating Feedback Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 shadow-xl animate-fade-in max-w-md">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setEditingTask(null);
          setSlotForNewTask(undefined);
        }}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
        initialStartTime={slotForNewTask}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={setConfig}
        onResetToSampleTasks={handleResetToSampleTasks}
        onClearAllTasks={handleClearAllTasks}
      />

      <AIScheduleAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        tasks={tasks}
        config={config}
        stats={stats}
        onAutoSchedule={handleAutoSchedule}
        onPostponeP4={handlePostponeP4}
      />

      <RebalanceModal
        isOpen={isRebalanceModalOpen}
        onClose={() => setIsRebalanceModalOpen(false)}
        config={config}
        onConfirmRebalance={handleConfirmRebalance}
      />

    </div>
  );
}
