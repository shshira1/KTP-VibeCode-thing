export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  durationMinutes: number; // in minutes e.g. 15, 30, 45, 60, 90, 120
  energyLevel: EnergyLevel;
  scheduledStart?: string; // "HH:MM", 24-hour format e.g. "09:00"
  scheduledEnd?: string;   // "HH:MM", 24-hour format e.g. "10:00"
  isFixedTime?: boolean;   // true for fixed commitments like meetings
  isCompleted: boolean;
  completedAt?: string;
  category?: string;
  createdAt: string;
}

export interface ScheduleConfig {
  workStart: string;       // "08:00"
  workEnd: string;         // "18:00"
  lunchStart: string;      // "12:00"
  lunchEnd: string;        // "13:00"
  bufferMinutes: number;   // 5 or 10 min break between tasks
  energyCurveOptimization: boolean; // Morning: high focus, Afternoon: steady, Late: low
}

export interface TimeInterval {
  startMinutes: number;
  endMinutes: number;
  label?: string;
}

export interface DayStats {
  totalTasks: number;
  completedTasks: number;
  scheduledMinutes: number;
  availableMinutes: number;
  freeMinutes: number;
  overCapacityMinutes: number;
  completionRate: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  p4Count: number;
}
