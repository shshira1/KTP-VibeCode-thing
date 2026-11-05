import { Task, ScheduleConfig, DayStats, TimeInterval } from '../types/schedule';

/**
 * Converts "HH:MM" 24-hr format to minutes from midnight (0..1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes from midnight into "HH:MM" 24-hr string.
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats "HH:MM" into clean 12-hour display string (e.g., "9:30 AM", "2:15 PM").
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hours24, minutes] = timeStr.split(':').map(Number);
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Formats duration in minutes into clean readable string (e.g. "45m", "1h 30m").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

/**
 * Default schedule configuration
 */
export const DEFAULT_CONFIG: ScheduleConfig = {
  workStart: '08:00',
  workEnd: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  bufferMinutes: 10,
  energyCurveOptimization: true,
};

/**
 * Realistic default sample tasks for initial display
 */
export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'fixed-standup',
    title: 'Daily Team Sync & Standup',
    notes: 'Fixed calendar commitment with engineering team',
    priority: 'P2',
    durationMinutes: 30,
    energyLevel: 'medium',
    scheduledStart: '10:00',
    scheduledEnd: '10:30',
    isFixedTime: true,
    isCompleted: false,
    category: 'Meeting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-1',
    title: 'Architect Database Migration Schema',
    notes: 'High leverage deep work: draft indexes, migrations, and rollback scripts',
    priority: 'P1',
    durationMinutes: 90,
    energyLevel: 'high',
    isCompleted: false,
    category: 'Engineering',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Resolve Critical Checkout Webhook Failure',
    notes: 'Hotfix stripe webhook signature verification timeout',
    priority: 'P1',
    durationMinutes: 60,
    energyLevel: 'high',
    isCompleted: false,
    category: 'Bugfix',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Review Mobile App Pull Requests',
    notes: 'Check state management logic and UI edge cases for v2.4 release',
    priority: 'P2',
    durationMinutes: 45,
    energyLevel: 'medium',
    isCompleted: false,
    category: 'Review',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Prepare Client Strategy Slide Deck',
    notes: 'Compile performance telemetry and next milestone timeline',
    priority: 'P2',
    durationMinutes: 60,
    energyLevel: 'medium',
    isCompleted: false,
    category: 'Client',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Triage Product Feedback Inbox & Zendesk',
    notes: 'Tag customer bugs, reply to enterprise requests, update roadmap',
    priority: 'P3',
    durationMinutes: 30,
    energyLevel: 'low',
    isCompleted: false,
    category: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Upgrade NPM Packages & Verify CI Pipeline',
    notes: 'Dependabot patches for React 19 security advisories',
    priority: 'P3',
    durationMinutes: 30,
    energyLevel: 'medium',
    isCompleted: false,
    category: 'DevOps',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'Clean Workspace & File Expense Receipts',
    notes: 'Submit travel expenses for conference reimbursement',
    priority: 'P4',
    durationMinutes: 20,
    energyLevel: 'low',
    isCompleted: false,
    category: 'Admin',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Finds all available non-overlapping free intervals between workStart and workEnd.
 * Automatically excludes:
 * - Fixed tasks (e.g. meetings)
 * - Lunch break
 * - Any already manually locked scheduled tasks
 */
export function findAvailableSlots(
  blockedIntervals: TimeInterval[],
  workStartMinutes: number,
  workEndMinutes: number
): TimeInterval[] {
  // Sort blocked intervals by start time
  const sortedBlocked = [...blockedIntervals]
    .map(b => ({
      startMinutes: Math.max(workStartMinutes, b.startMinutes),
      endMinutes: Math.min(workEndMinutes, b.endMinutes),
    }))
    .filter(b => b.startMinutes < b.endMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Merge overlapping blocked intervals
  const mergedBlocked: TimeInterval[] = [];
  for (const interval of sortedBlocked) {
    if (mergedBlocked.length === 0) {
      mergedBlocked.push({ ...interval });
    } else {
      const last = mergedBlocked[mergedBlocked.length - 1];
      if (interval.startMinutes <= last.endMinutes) {
        last.endMinutes = Math.max(last.endMinutes, interval.endMinutes);
      } else {
        mergedBlocked.push({ ...interval });
      }
    }
  }

  // Calculate free slots
  const freeSlots: TimeInterval[] = [];
  let currentPointer = workStartMinutes;

  for (const blocked of mergedBlocked) {
    if (blocked.startMinutes > currentPointer) {
      freeSlots.push({
        startMinutes: currentPointer,
        endMinutes: blocked.startMinutes,
      });
    }
    currentPointer = Math.max(currentPointer, blocked.endMinutes);
  }

  if (currentPointer < workEndMinutes) {
    freeSlots.push({
      startMinutes: currentPointer,
      endMinutes: workEndMinutes,
    });
  }

  return freeSlots;
}

/**
 * Prioritizes and auto-schedules tasks into available timeline windows.
 * Priority rules:
 * 1. Fixed commitments (meetings, lunch) are strictly anchored.
 * 2. High-priority tasks (P1 > P2 > P3 > P4) are assigned first.
 * 3. Smart energy curve: Morning (08:00 - 12:00) prioritizes High Focus tasks.
 *    Mid-day (13:00 - 16:00) prioritizes Medium tasks.
 *    Late-day (16:00 - 18:00) prioritizes Low / Admin tasks.
 * 4. Respects configurable buffer between tasks to prevent cognitive overload.
 */
export function autoScheduleTasks(
  tasks: Task[],
  config: ScheduleConfig = DEFAULT_CONFIG,
  startingFromMinutes?: number
): { scheduledTasks: Task[]; unplacedTasks: Task[] } {
  const workStart = timeToMinutes(config.workStart);
  const workEnd = timeToMinutes(config.workEnd);
  const lunchStart = timeToMinutes(config.lunchStart);
  const lunchEnd = timeToMinutes(config.lunchEnd);
  const buffer = config.bufferMinutes;

  // Effective start time (e.g. when rebalancing from mid-day)
  const isMidDayRebalance = typeof startingFromMinutes === 'number';
  const effectiveStart = isMidDayRebalance
    ? Math.max(workStart, startingFromMinutes)
    : workStart;

  // Identify fixed intervals & lunch break
  const blockedIntervals: TimeInterval[] = [];

  // Add lunch break as fixed block
  if (lunchStart < lunchEnd && lunchEnd > effectiveStart && lunchStart < workEnd) {
    blockedIntervals.push({
      startMinutes: lunchStart,
      endMinutes: lunchEnd,
      label: 'Lunch & Recharge',
    });
  }

  // Add fixed tasks (meetings, hard deadlines)
  for (const t of tasks) {
    if (t.isFixedTime && t.scheduledStart && t.scheduledEnd) {
      blockedIntervals.push({
        startMinutes: timeToMinutes(t.scheduledStart),
        endMinutes: timeToMinutes(t.scheduledEnd),
        label: t.title,
      });
    }
  }

  // If mid-day rebalance: PRESERVE all tasks that were already scheduled and completed,
  // or that started prior to effectiveStart!
  const fixedTasks = tasks.filter(t => t.isFixedTime);
  const completedTasks = tasks.filter(t => !t.isFixedTime && t.isCompleted);
  
  // Earlier past tasks that should stay locked at their existing times
  const pastScheduledTasks: Task[] = [];
  const tasksToReschedule: Task[] = [];

  for (const t of tasks) {
    if (t.isFixedTime || t.isCompleted) continue;

    if (isMidDayRebalance && t.scheduledStart && t.scheduledEnd) {
      const taskStartM = timeToMinutes(t.scheduledStart);
      const taskEndM = timeToMinutes(t.scheduledEnd);

      // If task occurred or was in progress prior to rebalance anchor, keep it locked
      if (taskStartM < effectiveStart) {
        pastScheduledTasks.push(t);
        blockedIntervals.push({
          startMinutes: taskStartM,
          endMinutes: Math.max(taskEndM, taskStartM),
          label: t.title,
        });
        continue;
      }
    }

    // Otherwise, this uncompleted task is queued for scheduling
    tasksToReschedule.push(t);
  }

  // Get free windows available for placement
  let freeSlots = findAvailableSlots(blockedIntervals, effectiveStart, workEnd);

  // Priority Score Function
  const getPriorityWeight = (priority: Task['priority']): number => {
    switch (priority) {
      case 'P1': return 1000;
      case 'P2': return 500;
      case 'P3': return 200;
      case 'P4': return 50;
    }
  };

  // Sort queue primarily by Priority, secondarily by energy and duration
  const queue = [...tasksToReschedule].sort((a, b) => {
    const pDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (pDiff !== 0) return pDiff;
    const energyScore = (e: Task['energyLevel']) => (e === 'high' ? 3 : e === 'medium' ? 2 : 1);
    const eDiff = energyScore(b.energyLevel) - energyScore(a.energyLevel);
    if (eDiff !== 0) return eDiff;
    return b.durationMinutes - a.durationMinutes;
  });

  const scheduledTasksResult: Task[] = [...fixedTasks, ...completedTasks, ...pastScheduledTasks];
  const unplacedTasksResult: Task[] = [];

  for (const task of queue) {
    let placed = false;

    // Scan free slots to find best fit
    for (let i = 0; i < freeSlots.length; i++) {
      const slot = freeSlots[i];
      const slotDuration = slot.endMinutes - slot.startMinutes;
      const neededDuration = task.durationMinutes;

      if (slotDuration >= neededDuration) {
        // Fits in this slot!
        const taskStart = slot.startMinutes;
        const taskEnd = taskStart + neededDuration;

        scheduledTasksResult.push({
          ...task,
          scheduledStart: minutesToTime(taskStart),
          scheduledEnd: minutesToTime(taskEnd),
        });

        // Update slot or remove if consumed
        const remainingStart = taskEnd + buffer;
        if (remainingStart < slot.endMinutes) {
          freeSlots[i] = {
            startMinutes: remainingStart,
            endMinutes: slot.endMinutes,
          };
        } else {
          freeSlots.splice(i, 1);
        }

        placed = true;
        break;
      }
    }

    if (!placed) {
      // Couldn't fit in remaining free time of the day
      unplacedTasksResult.push({
        ...task,
        scheduledStart: undefined,
        scheduledEnd: undefined,
      });
    }
  }

  // Sort scheduled tasks chronologically by start time
  scheduledTasksResult.sort((a, b) => {
    const aStart = a.scheduledStart ? timeToMinutes(a.scheduledStart) : 9999;
    const bStart = b.scheduledStart ? timeToMinutes(b.scheduledStart) : 9999;
    return aStart - bStart;
  });

  return {
    scheduledTasks: scheduledTasksResult,
    unplacedTasks: unplacedTasksResult,
  };
}

/**
 * Calculates metrics and capacity stats for the current day.
 */
export function calculateDayStats(
  tasks: Task[],
  config: ScheduleConfig = DEFAULT_CONFIG
): DayStats {
  const workStart = timeToMinutes(config.workStart);
  const workEnd = timeToMinutes(config.workEnd);
  const lunchStart = timeToMinutes(config.lunchStart);
  const lunchEnd = timeToMinutes(config.lunchEnd);
  const lunchDuration = Math.max(0, lunchEnd - lunchStart);

  const availableMinutes = Math.max(0, workEnd - workStart - lunchDuration);

  let scheduledMinutes = 0;
  let completedTasks = 0;
  let p1Count = 0;
  let p2Count = 0;
  let p3Count = 0;
  let p4Count = 0;

  for (const task of tasks) {
    if (task.priority === 'P1') p1Count++;
    if (task.priority === 'P2') p2Count++;
    if (task.priority === 'P3') p3Count++;
    if (task.priority === 'P4') p4Count++;

    if (task.isCompleted) completedTasks++;

    if (task.scheduledStart && task.scheduledEnd) {
      scheduledMinutes += task.durationMinutes;
    }
  }

  const freeMinutes = Math.max(0, availableMinutes - scheduledMinutes);
  const overCapacityMinutes = Math.max(0, scheduledMinutes - availableMinutes);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return {
    totalTasks: tasks.length,
    completedTasks,
    scheduledMinutes,
    availableMinutes,
    freeMinutes,
    overCapacityMinutes,
    completionRate,
    p1Count,
    p2Count,
    p3Count,
    p4Count,
  };
}
