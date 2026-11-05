import React, { useState, useEffect } from 'react';
import { Task, Priority, EnergyLevel } from '../types/schedule';
import { X, Clock, Flame, Activity, Coffee, Lock } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  initialStartTime?: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  initialStartTime,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('P2');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [isFixedTime, setIsFixedTime] = useState<boolean>(false);
  const [scheduledStart, setScheduledStart] = useState<string>('09:00');
  const [scheduledEnd, setScheduledEnd] = useState<string>('09:45');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || '');
      setCategory(initialTask.category || '');
      setPriority(initialTask.priority);
      setDurationMinutes(initialTask.durationMinutes);
      setEnergyLevel(initialTask.energyLevel);
      setIsFixedTime(!!initialTask.isFixedTime);
      setScheduledStart(initialTask.scheduledStart || '09:00');
      setScheduledEnd(initialTask.scheduledEnd || '09:45');
    } else {
      setTitle('');
      setNotes('');
      setCategory('');
      setPriority('P2');
      setDurationMinutes(45);
      setEnergyLevel('medium');
      setIsFixedTime(false);
      if (initialStartTime) {
        setScheduledStart(initialStartTime);
        const [h, m] = initialStartTime.split(':').map(Number);
        const endTotal = h * 60 + m + 45;
        const endH = Math.floor(endTotal / 60) % 24;
        const endM = endTotal % 60;
        setScheduledEnd(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
      } else {
        setScheduledStart('09:00');
        setScheduledEnd('09:45');
      }
    }
  }, [initialTask, initialStartTime, isOpen]);

  // Sync scheduledEnd when duration changes if fixed
  const handleDurationPreset = (mins: number) => {
    setDurationMinutes(mins);
    if (scheduledStart) {
      const [h, m] = scheduledStart.split(':').map(Number);
      const endTotal = h * 60 + m + mins;
      const endH = Math.floor(endTotal / 60) % 24;
      const endM = endTotal % 60;
      setScheduledEnd(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      notes: notes.trim() || undefined,
      category: category.trim() || undefined,
      priority,
      durationMinutes,
      energyLevel,
      isFixedTime,
      ...(isFixedTime
        ? { scheduledStart, scheduledEnd }
        : initialTask?.scheduledStart
        ? { scheduledStart: initialTask.scheduledStart, scheduledEnd: initialTask.scheduledEnd }
        : {}),
    });

    onClose();
  };

  const durationPresets = [15, 30, 45, 60, 90, 120];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Finalize quarterly financial report"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Notes / Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Engineering, Client, Admin"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Brief context or deliverable"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Priority Ranking (Urgency & Impact)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { p: 'P1' as Priority, name: 'P1 Urgent', desc: 'Critical focus', color: 'border-rose-500/80 bg-rose-950/30 text-rose-300' },
                { p: 'P2' as Priority, name: 'P2 High', desc: 'Core execution', color: 'border-amber-500/80 bg-amber-950/30 text-amber-300' },
                { p: 'P3' as Priority, name: 'P3 Medium', desc: 'Routine updates', color: 'border-indigo-500/80 bg-indigo-950/30 text-indigo-300' },
                { p: 'P4' as Priority, name: 'P4 Low', desc: 'Backlog / buffer', color: 'border-slate-500/80 bg-slate-900 text-slate-300' },
              ].map(item => (
                <button
                  type="button"
                  key={item.p}
                  onClick={() => setPriority(item.p)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    priority === item.p
                      ? `${item.color} font-semibold ring-1 ring-white/10`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{item.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Estimated Duration
              </label>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {durationMinutes} minutes
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {durationPresets.map(mins => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => handleDurationPreset(mins)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                    durationMinutes === mins
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level Requirement */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cognitive Energy Required
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEnergyLevel('high')}
                className={`p-2 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
                  energyLevel === 'high'
                    ? 'border-rose-500/80 bg-rose-950/30 text-rose-300 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Deep Work</span>
              </button>

              <button
                type="button"
                onClick={() => setEnergyLevel('medium')}
                className={`p-2 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
                  energyLevel === 'medium'
                    ? 'border-amber-500/80 bg-amber-950/30 text-amber-300 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Steady</span>
              </button>

              <button
                type="button"
                onClick={() => setEnergyLevel('low')}
                className={`p-2 rounded-lg border flex items-center gap-2 text-xs transition-colors ${
                  energyLevel === 'low'
                    ? 'border-slate-500/80 bg-slate-800 text-slate-200 font-medium'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-slate-400" />
                <span>Low / Admin</span>
              </button>
            </div>
          </div>

          {/* Fixed Time / Meeting Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={isFixedTime}
                onChange={e => setIsFixedTime(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-indigo-400" />
                Fixed Calendar Commitment (Meeting, Standup, Hard Deadline)
              </span>
            </label>

            {isFixedTime && (
              <div className="grid grid-cols-2 gap-3 mt-3 pl-6">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={scheduledStart}
                    onChange={e => setScheduledStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={scheduledEnd}
                    onChange={e => setScheduledEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
