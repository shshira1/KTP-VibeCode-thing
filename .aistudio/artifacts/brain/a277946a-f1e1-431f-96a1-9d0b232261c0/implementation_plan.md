# ChronoFocus – Priority-Driven Day Calendar & Auto-Scheduler

ChronoFocus is an intelligent productivity calendar and daily task scheduler that transforms an unsorted or prioritized backlog of tasks into a realistic, structured, and completable day timeline. It pairs priority-based algorithmic time-blocking with energy-level matching to ensure high-leverage tasks get scheduled during peak focus hours while preserving necessary rest buffers.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions incorporate your preferences from the Phase 1 interview:

- **Confirmed: Scheduling Strategy**: Smart time-blocking algorithm that maps high-priority and high-energy tasks (P1/P2, Deep Work) to morning peak focus blocks, distributes medium tasks through midday, and reserves low-energy/admin tasks for later hours, with automatic 5–10 minute transition buffers.
- **Confirmed: Calendar Timeframe & Layout**: Dual-column workspace featuring a prioritized task backlog on the left and a continuous, high-resolution day timeline on the right, enabling one-click auto-scheduling as well as manual drag-and-drop adjustments.
- **Confirmed: Visual Aesthetic**: Sleek modern dark mode (`#0B0F17` canvas, `#111827` panels, `#1F2937` borders) with crisp tabular numerals and subtle, restrained priority accent indicators (P1 Urgent Red, P2 High Amber, P3 Medium Indigo, P4 Low Slate).
- **Default Work Configuration**: 8:00 AM – 6:00 PM work window with a configurable 12:00 PM – 1:00 PM lunch break and configurable transition buffers. Over-capacity warnings will trigger if total planned duration exceeds available hours.

---

## 1. Overview & Core Concept

### What It Does
- **Prioritized Task Backlog**: Add tasks with priority (P1 Urgent & Important, P2 High, P3 Medium, P4 Low), estimated duration (15m to 180m), energy requirement (High Focus, Medium Execution, Low/Quick Admin), and optional fixed due times.
- **Smart Priority Auto-Scheduler**: Algorithms evaluate available free calendar slots between fixed appointments and breaks, sorting tasks by priority and energy level to produce a realistic, achievable schedule.
- **Interactive Day Timeline**: Visual 15-minute grid showing scheduled blocks, current-time indicator line, task completion toggles, and live progress statistics (planned vs. completed hours, buffer health).
- **Conflict & Over-Capacity Guard**: Proactively warns when task commitments exceed available working hours, highlighting tasks that should be rolled over or down-prioritized.
- **Interactive Adjustments**: Drag to reorder, click to reschedule, split tasks that exceed 90 minutes, and one-click "Rebalance Schedule" when unexpected interruptions occur.
- **Smart AI Optimization (Gemini-Powered)**: Optional AI schedule assistant that analyzes task descriptions to refine time estimates, suggest optimal sequencing, and draft focused work sprints.

### Target Audience
Professionals, developers, students, and project leads who struggle with task overload and wish to bridge the gap between static to-do lists and realistic time availability.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│ 1. Capture Task │ ───>  │ 2. Priority & Energy │ ───>  │ 3. Auto-Schedule    │
│ Quick inline    │       │ Assign P1-P4,        │       │ 1-Click Time Block  │
│ title & mins    │       │ High/Med/Low focus   │       │ into optimal slots  │
└─────────────────┘       └──────────────────────┘       └──────────┬──────────┘
                                                                    │
┌─────────────────┐       ┌──────────────────────┐                  │
│ 5. Complete &   │ <───  │ 4. Day Timeline      │ <────────────────┘
│ Track Progress  │       │ Live time line, drag │
│ Tabular stats   │       │ adjust & rebalance   │
└─────────────────┘       └──────────────────────┘
```

1. **Zero-State / Initial Load**: The user opens the dashboard pre-seeded with realistic daily sample tasks (e.g., Code Review, Product Architecture, Team Sync, Client Inbox).
2. **Backlog Management**: The left sidebar lists tasks grouped or sorted by priority (P1 to P4). Each task displays duration badges (`45m`, `90m`), energy tag, and scheduling status (Unscheduled vs. Scheduled time badge).
3. **Auto-Scheduling the Day**: The user clicks **"Auto-Schedule Day"**. The scheduler scans the calendar, reserves fixed slots (e.g., Lunch, Standup), and places P1 high-energy tasks into prime morning slots, followed by P2/P3/P4.
4. **Execution & Adjustment**: As the day progresses, clicking checkboxes marks tasks completed with clean strikethrough and progress bar increments. If a task runs long, clicking **"Rebalance Remaining"** shifts upcoming tasks forward.

### Visual Identity & Theme
- **Theme Posture**: Deep dark workspace (`#090D16` canvas, `#111827` surface cards, `#1F2937` borders).
- **Typography**: `Plus Jakarta Sans` for clean titles, headings, and buttons; `JetBrains Mono` / `tabular-nums` for time slots, start/end timestamps, and duration counters.
- **Color Strategy (60-30-10)**:
  - 60% Dark Slate Canvas (`#090D16` / `#0F172A`)
  - 30% Structural Panels & Dividers (`#111827`, `#1E293B`, border `#334155/40`)
  - 10% High-Intent Accents (Indigo `#6366F1` primary CTA, Red `#EF4444` for P1, Amber `#F59E0B` for P2, Cyan `#06B6D4` for focus states)
- **Zero-Pill Discipline**: Metadata uses clean text separators (`P1 · 45m · High Focus`) without clunky rounded pill backgrounds.
- **Top Bar Contract**:
  - Zone 1: `ChronoFocus` wordmark + today's formatted date (`Wednesday, Nov 4`)
  - Zone 2: Navigation tabs (`Day Timeline`, `Priority Backlog`, `Analytics & Capacity`)
  - Zone 3: Primary Action (`⚡ Auto-Schedule Day` + `+ New Task`)

---

## 3. Key Product Decisions & Trade-Offs

- **Deterministic Core Algorithm + AI Enhancements**:
  - *Chosen Approach*: The primary auto-scheduling engine runs completely client-side with zero latency using an interval-packing algorithm. An optional "AI Energy Optimizer" button calls Gemini to analyze task complexity and propose an ideal routine.
  - *Why*: Daily planners must be instantly responsive, rock-solid offline, and deterministic, while AI provides intelligent insights when requested.
- **Persistent LocalStorage State**:
  - *Chosen Approach*: State auto-saves to `localStorage` with export/import JSON capability and a 1-click "Reset to Sample Data" button.
  - *Why*: Instant setup, zero friction, and persistent user data across reloads.
- **Visual Day Timeline with 15-Minute Snapping**:
  - *Chosen Approach*: Continuous vertical timeline with realistic proportional block heights ($1\text{ hour} = 64\text{px}$) and clear drag handles to lengthen or re-time blocks.
  - *Why*: Gives tangible spatial awareness of time scarcity, preventing overbooking.

---

## 4. Technical Architecture & Data Strategy

### Component & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App State                                 │
│  - tasks: Task[] (P1..P4, estimatedMins, energy, scheduledTime, done)  │
│  - scheduleConfig: { workStart, workEnd, lunchStart, lunchEnd, buffer } │
│  - activeView: 'day' | 'backlog' | 'capacity'                          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       TaskBacklog Panel (Left)      │   │     DayTimeline Panel (Right)│
│  - Priority grouping (P1 -> P4)     │   │  - 07:00 to 20:00 time axis  │
│  - Quick Task Creator               │   │  - Fixed slots & lunch block │
│  - Filter & Sort (Energy, Priority) │   │  - Scheduled Task Cards      │
│  - "Schedule" button per task       │   │  - Current-time red pointer  │
└──────────────────┬──────────────────┘   └──────────────┬───────────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │    Auto-Scheduler Engine      │
                      │  - Priority sorting           │
                      │  - Free-gap finder            │
                      │  - Energy-curve allocation    │
                      │  - Buffer insertion           │
                      └───────────────────────────────┘
```

### Data Models

```typescript
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  durationMinutes: number; // e.g. 15, 30, 45, 60, 90, 120
  energyLevel: EnergyLevel;
  scheduledStart?: string; // "HH:MM" e.g. "09:00"
  scheduledEnd?: string;   // "HH:MM" e.g. "10:15"
  isFixedTime?: boolean;   // e.g. meeting at exact time
  isCompleted: boolean;
  category?: string;
  createdAt: string;
}

export interface ScheduleConfig {
  workStart: string; // "08:00"
  workEnd: string;   // "18:00"
  lunchStart: string; // "12:00"
  lunchEnd: string;   // "13:00"
  bufferMinutes: number; // 5 or 10
}
```

---

## Step-by-Step Implementation Plan

### Step 1: Foundation & Typography
- Configure `index.html` with title, meta tags, and web fonts (`Plus Jakarta Sans` and `JetBrains Mono`).
- Set up Tailwind v4 dark mode configuration and custom color tokens in `src/index.css`.
- Update `metadata.json` with app title and description.

### Step 2: Core Data Types & Scheduling Engine
- Create `src/types/schedule.ts` defining `Task`, `Priority`, `EnergyLevel`, and `ScheduleConfig`.
- Implement `src/utils/scheduler.ts`:
  - Interval math functions (time to minutes, minutes to `HH:MM`).
  - Available free-slot finder between working hours and fixed appointments.
  - Priority & energy-based allocation algorithm:
    - Sort backlog: Priority weight (P1 > P2 > P3 > P4) then Energy requirement.
    - Morning blocks (08:00–12:00) prioritize High Energy P1/P2 tasks.
    - Afternoon blocks (13:00–16:00) prioritize Medium Execution tasks.
    - Late blocks (16:00–18:00) prioritize Low Energy / Admin tasks.
    - Insert configured buffer between non-contiguous blocks.
- Seed data generator with a realistic, engaging workday.

### Step 3: Top Bar & Metric Strip
- Implement top bar adhering to the 3-zone contract.
- Daily capacity summary strip: Total planned hours vs. available work hours, completion percentage, and buffer status.

### Step 4: Prioritized Task Backlog Component
- Fast task entry form (title, priority selector P1-P4, duration presets `15m/30m/45m/60m/90m`, energy level).
- Grouped priority backlog list with status indicators, edit/delete actions, and instant manual "Schedule into next slot" action.
- Filter and search bar.

### Step 5: Day Calendar Timeline Component
- Scaled 24-hour / workday timeline from 07:00 to 20:00 with 15-minute subdivisions.
- Current-time horizontal red indicator line.
- Render scheduled task blocks with priority color accents, start/end time, checkbox, and un-schedule button.
- Lunch break and fixed-slot indicators.
- Quick drag/time-adjust controls.

### Step 6: Interactive Auto-Schedule & Rebalance Controls
- **"⚡ Auto-Schedule Day"** with smooth layout animations.
- **"Rebalance Schedule"** button that recalculates remaining tasks from the current hour forward if morning tasks delayed the day.
- Over-capacity modal/alert if tasks exceed available time, suggesting which P4/P3 tasks can be safely postponed.

### Step 7: AI Schedule Assistant (Gemini API Integration)
- Optional modal/drawer where Gemini analyzes the user's workload, provides a 3-point daily strategy briefing, and suggests smart time-box optimizations.

### Step 8: Build Verification & Polish
- Run `compile_applet` and `lint_applet`.
- Verify clean responsive behavior, keyboard accessibility, and WCAG AA contrast.
