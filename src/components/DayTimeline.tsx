import React, { useState, useEffect } from 'react';
import { Task, ScheduleConfig } from '../types/schedule';
import { timeToMinutes, minutesToTime, formatTimeDisplay, formatDuration } from '../utils/scheduler';
import {
  Check,
  Clock,
  Lock,
  Utensils,
  ChevronUp,
  ChevronDown,
  X,
  Flame,
  Activity,
  Coffee,
  Plus,
} from 'lucide-react';

interface DayTimelineProps {
  tasks: Task[];
  config: ScheduleConfig;
  placingTask?: Task | null;
  onToggleComplete: (taskId: string) => void;
  onUnschedule: (taskId: string) => void;
  onNudgeTask: (taskId: string, deltaMinutes: number) => void;
  onSelectSlotForNewTask: (startTimeStr: string) => void;
  onEditTask: (task: Task) => void;
  onDropTask: (taskId: string, startMinutes: number) => void;
  onCancelPlacing?: () => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  tasks,
  config,
  placingTask,
  onToggleComplete,
  onUnschedule,
  onNudgeTask,
  onSelectSlotForNewTask,
  onEditTask,
  onDropTask,
  onCancelPlacing,
}) => {
  // Timeline boundaries (07:00 to 20:00)
  const START_HOUR = 7;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const HOUR_HEIGHT = 72; // pixels per hour
  const START_MINUTES = START_HOUR * 60; // 420

  // Drag over target slot state (snapped to 15m)
  const [dragOverSlotMinutes, setDragOverSlotMinutes] = useState<number | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Placement mode hover slot state (snapped to 15m)
  const [placementHoverMinutes, setPlacementHoverMinutes] = useState<number | null>(null);

  // Current time tracker
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000); // update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  // Listen for drag start/end custom events and native drag events
  useEffect(() => {
    const handleDragStartEvent = (e: any) => {
      if (e.detail?.taskId) {
        setDraggedTaskId(e.detail.taskId);
      }
    };

    const handleGlobalDragEnd = () => {
      setDragOverSlotMinutes(null);
      setDraggedTaskId(null);
      if (typeof window !== 'undefined') {
        (window as any).__CHRONO_DRAG_TASK_ID__ = null;
      }
    };

    window.addEventListener('chrono-drag-start', handleDragStartEvent as EventListener);
    window.addEventListener('chrono-drag-end', handleGlobalDragEnd);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      window.removeEventListener('chrono-drag-start', handleDragStartEvent as EventListener);
      window.removeEventListener('chrono-drag-end', handleGlobalDragEnd);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

  // Filter scheduled tasks
  const scheduledTasks = tasks.filter(t => t.scheduledStart && t.scheduledEnd);

  // Identify active preview task (either placingTask or dragged task)
  const effectiveDragTaskId = draggedTaskId || (typeof window !== 'undefined' ? (window as any).__CHRONO_DRAG_TASK_ID__ : null);
  const previewTask = placingTask || tasks.find(t => t.id === effectiveDragTaskId) || null;

  // Position calculation
  const getTopOffset = (timeStr: string) => {
    const mins = timeToMinutes(timeStr);
    return Math.max(0, ((mins - START_MINUTES) / 60) * HOUR_HEIGHT);
  };

  const getHeight = (durationMinutes: number) => {
    return Math.max(28, (durationMinutes / 60) * HOUR_HEIGHT);
  };

  // Lunch block coordinates
  const lunchStartMins = timeToMinutes(config.lunchStart);
  const lunchEndMins = timeToMinutes(config.lunchEnd);
  const lunchDuration = Math.max(0, lunchEndMins - lunchStartMins);
  const lunchTop = Math.max(0, ((lunchStartMins - START_MINUTES) / 60) * HOUR_HEIGHT);
  const lunchHeight = (lunchDuration / 60) * HOUR_HEIGHT;

  // Work bounds
  const workStartTop = ((timeToMinutes(config.workStart) - START_MINUTES) / 60) * HOUR_HEIGHT;
  const workEndTop = ((timeToMinutes(config.workEnd) - START_MINUTES) / 60) * HOUR_HEIGHT;

  // Current time marker top
  const isNowInView = currentMinutes >= START_MINUTES && currentMinutes <= END_HOUR * 60;
  const nowTop = ((currentMinutes - START_MINUTES) / 60) * HOUR_HEIGHT;

  const hoursArray = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  // Active preview slot (either from dragover or placement hover)
  const activePreviewSlot = dragOverSlotMinutes !== null ? dragOverSlotMinutes : (placingTask ? placementHoverMinutes : null);
  const previewDuration = previewTask?.durationMinutes || 45;
  const previewEndMinutes = activePreviewSlot !== null ? Math.min(END_HOUR * 60, activePreviewSlot + previewDuration) : null;

  return (
    <div className="flex flex-col h-full bg-[#090D16] text-slate-100 select-none">
      
      {/* Placing Task Active Prompt Banner */}
      {placingTask && (
        <div className="bg-indigo-950/90 border-b border-indigo-700/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-indigo-100 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>
              Placement Mode: Click any open hour on the timeline to place <strong>"{placingTask.title}"</strong> ({formatDuration(placingTask.durationMinutes)})
            </span>
          </div>
          {onCancelPlacing && (
            <button
              onClick={onCancelPlacing}
              className="px-2.5 py-1 rounded bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-xs font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Timeline Controls Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0D121F] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Day Schedule Timeline
          </h2>
          <p className="text-xs text-slate-400">
            {config.workStart} – {config.workEnd} working window · {scheduledTasks.length} time blocks scheduled
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/70">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Now: {formatTimeDisplay(minutesToTime(currentMinutes))}</span>
          </span>
        </div>
      </div>

      {/* Scrollable Timeline Grid Container */}
      <div className="flex-1 overflow-y-auto relative p-4 sm:p-6">
        <div
          className="relative max-w-4xl mx-auto flex"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        >
          {/* Working hours subtle backdrop */}
          <div
            className="absolute left-16 sm:left-20 right-0 bg-slate-900/30 border-y border-dashed border-indigo-900/40 pointer-events-none rounded-lg"
            style={{
              top: `${workStartTop}px`,
              height: `${workEndTop - workStartTop}px`,
            }}
          />

          {/* Left Hour Axis Labels */}
          <div className="w-16 sm:w-20 shrink-0 relative">
            {hoursArray.map((hour, idx) => {
              const top = idx * HOUR_HEIGHT;
              const timeString = `${String(hour).padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="absolute left-0 -top-2 text-right pr-3 sm:pr-4 w-full"
                  style={{ top: `${top}px` }}
                >
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {formatTimeDisplay(timeString)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid Content Area */}
          <div
            onDragEnter={e => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDragOver={e => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetY = e.clientY - rect.top;
              const rawMinutes = START_MINUTES + (offsetY / HOUR_HEIGHT) * 60;
              // Snap to 15m intervals
              const snapped = Math.round(rawMinutes / 15) * 15;
              const clamped = Math.max(START_MINUTES, Math.min(END_HOUR * 60 - 30, snapped));
              if (dragOverSlotMinutes !== clamped) {
                setDragOverSlotMinutes(clamped);
              }
            }}
            onDragLeave={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX < rect.left ||
                e.clientX >= rect.right ||
                e.clientY < rect.top ||
                e.clientY >= rect.bottom
              ) {
                setDragOverSlotMinutes(null);
              }
            }}
            onDrop={e => {
              e.preventDefault();
              let taskId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
              if (!taskId && typeof window !== 'undefined') {
                taskId = (window as any).__CHRONO_DRAG_TASK_ID__;
              }
              if (!taskId && draggedTaskId) {
                taskId = draggedTaskId;
              }
              if (taskId && dragOverSlotMinutes !== null) {
                onDropTask(taskId, dragOverSlotMinutes);
              }
              setDragOverSlotMinutes(null);
              setDraggedTaskId(null);
              if (typeof window !== 'undefined') {
                (window as any).__CHRONO_DRAG_TASK_ID__ = null;
              }
            }}
            onMouseMove={e => {
              if (placingTask) {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const rawMinutes = START_MINUTES + (offsetY / HOUR_HEIGHT) * 60;
                const snapped = Math.round(rawMinutes / 15) * 15;
                const clamped = Math.max(START_MINUTES, Math.min(END_HOUR * 60 - 30, snapped));
                if (placementHoverMinutes !== clamped) {
                  setPlacementHoverMinutes(clamped);
                }
              }
            }}
            onMouseLeave={() => {
              setPlacementHoverMinutes(null);
            }}
            onClick={e => {
              if (placingTask) {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const rawMinutes = START_MINUTES + (offsetY / HOUR_HEIGHT) * 60;
                const snapped = Math.round(rawMinutes / 15) * 15;
                const clamped = Math.max(START_MINUTES, Math.min(END_HOUR * 60 - 30, snapped));
                onDropTask(placingTask.id, clamped);
                setPlacementHoverMinutes(null);
                if (onCancelPlacing) onCancelPlacing();
              }
            }}
            className={`flex-1 relative border-l border-slate-800/80 ${
              placingTask ? 'cursor-crosshair' : ''
            }`}
          >
            {/* Live Drag & Drop / Placement Ghost Slot Preview */}
            {activePreviewSlot !== null && (
              <div
                className="absolute left-2 right-2 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-950/85 z-30 pointer-events-none flex flex-col justify-between p-2.5 text-indigo-100 shadow-2xl shadow-indigo-500/30 backdrop-blur-sm transition-all duration-75 ring-1 ring-indigo-400/50"
                style={{
                  top: `${getTopOffset(minutesToTime(activePreviewSlot))}px`,
                  height: `${getHeight(previewDuration)}px`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {previewTask ? previewTask.title : 'Scheduled Time Block'}
                    </span>
                    {previewTask && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-800 text-indigo-200">
                        {previewTask.priority}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 shrink-0 font-semibold bg-indigo-900/90 px-2 py-0.5 rounded border border-indigo-700">
                    {formatDuration(previewDuration)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-indigo-200/90 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="font-semibold tabular-nums">
                      {formatTimeDisplay(minutesToTime(activePreviewSlot))} – {formatTimeDisplay(minutesToTime(previewEndMinutes || (activePreviewSlot + previewDuration)))}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-300/80 hidden sm:inline">
                    {placingTask ? 'Click timeline to slot here' : 'Release mouse to slot here'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Horizontal Grid lines */}
            {hoursArray.map((hour, idx) => {
              const top = idx * HOUR_HEIGHT;
              return (
                <React.Fragment key={hour}>
                  {/* Full hour line */}
                  <div
                    onClick={() => {
                      const timeStr = `${String(hour).padStart(2, '0')}:00`;
                      onSelectSlotForNewTask(timeStr);
                    }}
                    title={`Click to add task at ${formatTimeDisplay(`${String(hour).padStart(2, '0')}:00`)}`}
                    className="absolute left-0 right-0 border-t border-slate-800/60 hover:bg-indigo-500/5 cursor-pointer transition-colors group flex items-center justify-end pr-3"
                    style={{ top: `${top}px`, height: `${HOUR_HEIGHT}px` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-400 font-mono transition-opacity flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add at {formatTimeDisplay(`${String(hour).padStart(2, '0')}:00`)}
                    </span>
                  </div>

                  {/* Half-hour dashed line */}
                  {idx < TOTAL_HOURS && (
                    <div
                      className="absolute left-0 right-0 border-t border-slate-800/30 border-dashed pointer-events-none"
                      style={{ top: `${top + HOUR_HEIGHT / 2}px` }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Lunch Break Protected Block */}
            {lunchDuration > 0 && (
              <div
                className="absolute left-2 right-2 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300/80 flex items-center px-4 gap-3 z-10 backdrop-blur-xs pointer-events-none"
                style={{
                  top: `${lunchTop}px`,
                  height: `${lunchHeight}px`,
                }}
              >
                <div className="w-6 h-6 rounded-md bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-amber-300">
                    Lunch & Cognitive Recharge
                  </div>
                  <div className="text-[10px] font-mono text-amber-400/70">
                    {formatTimeDisplay(config.lunchStart)} – {formatTimeDisplay(config.lunchEnd)}
                  </div>
                </div>
              </div>
            )}

            {/* Live Current Time Marker */}
            {isNowInView && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: `${nowTop}px` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 shadow-sm shadow-rose-500/80 animate-pulse" />
                <div className="h-[2px] bg-rose-500/80 flex-1 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded ml-1 shadow-sm">
                  {formatTimeDisplay(minutesToTime(currentMinutes))}
                </span>
              </div>
            )}

            {/* Scheduled Tasks Render */}
            {scheduledTasks.map(task => {
              const top = getTopOffset(task.scheduledStart!);
              const height = getHeight(task.durationMinutes);
              const isP1 = task.priority === 'P1';
              const isP2 = task.priority === 'P2';
              const isP3 = task.priority === 'P3';

              const priorityBorderColor = isP1
                ? 'border-l-rose-500'
                : isP2
                ? 'border-l-amber-400'
                : isP3
                ? 'border-l-indigo-400'
                : 'border-l-slate-400';

              const priorityBg = task.isCompleted
                ? 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                : task.isFixedTime
                ? 'bg-slate-900/95 border-indigo-700/60 shadow-md shadow-indigo-950/20'
                : isP1
                ? 'bg-[#151218] border-rose-900/40 hover:border-rose-700/60 shadow-md shadow-rose-950/20'
                : isP2
                ? 'bg-[#161410] border-amber-900/40 hover:border-amber-700/60 shadow-md'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm';

              return (
                <div
                  key={task.id}
                  draggable={!task.isFixedTime && !task.isCompleted}
                  onDragStart={e => {
                    if (typeof window !== 'undefined') {
                      (window as any).__CHRONO_DRAG_TASK_ID__ = task.id;
                      window.dispatchEvent(new CustomEvent('chrono-drag-start', { detail: { taskId: task.id } }));
                    }
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.setData('text', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('chrono-drag-end'));
                      setTimeout(() => {
                        (window as any).__CHRONO_DRAG_TASK_ID__ = null;
                      }, 300);
                    }
                  }}
                  className={`absolute left-2 right-2 rounded-lg border border-l-4 ${priorityBorderColor} ${priorityBg} p-2.5 transition-all duration-150 z-10 flex flex-col justify-between group overflow-hidden ${
                    !task.isFixedTime && !task.isCompleted
                      ? 'cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-indigo-500/50'
                      : ''
                  }`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    
                    {/* Left: Complete Checkbox + Title */}
                    <div className="flex items-start gap-2 min-w-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                          task.isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-700 hover:border-slate-500 bg-slate-800/80'
                        }`}
                      >
                        {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => onEditTask(task)}
                            className={`text-xs font-semibold cursor-pointer truncate ${
                              task.isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-100 hover:text-indigo-300'
                            }`}
                          >
                            {task.title}
                          </span>

                          {task.isFixedTime && (
                            <span className="flex items-center gap-0.5 text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-800/40">
                              <Lock className="w-2.5 h-2.5" />
                              Fixed
                            </span>
                          )}
                        </div>

                        {height > 50 && task.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Time Span & Duration */}
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[11px] font-mono font-medium text-slate-200 tabular-nums">
                          {formatTimeDisplay(task.scheduledStart!)} – {formatTimeDisplay(task.scheduledEnd!)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {formatDuration(task.durationMinutes)}
                        </div>
                      </div>

                      {/* Action buttons (revealed on hover) */}
                      {!task.isFixedTime && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          {/* Nudge earlier 15m */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onNudgeTask(task.id, -15);
                            }}
                            title="Shift 15m earlier"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Nudge later 15m */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onNudgeTask(task.id, 15);
                            }}
                            title="Shift 15m later"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Unschedule */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onUnschedule(task.id);
                            }}
                            title="Unschedule task back to backlog"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Bottom tags if height permits */}
                  {height >= 60 && (
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-slate-300">{task.priority}</span>
                      <span className="text-slate-700">·</span>
                      {task.energyLevel === 'high' ? (
                        <span className="text-rose-400 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> High Focus
                        </span>
                      ) : task.energyLevel === 'medium' ? (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5" /> Medium
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <Coffee className="w-2.5 h-2.5" /> Low Focus
                        </span>
                      )}

                      {task.category && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-slate-400">{task.category}</span>
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>
      </div>

    </div>
  );
};
