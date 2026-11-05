import React, { useState } from 'react';
import { ScheduleConfig } from '../types/schedule';
import { X, Clock, Utensils, Sliders, RotateCcw, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScheduleConfig;
  onSaveConfig: (newConfig: ScheduleConfig) => void;
  onResetToSampleTasks: () => void;
  onClearAllTasks: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetToSampleTasks,
  onClearAllTasks,
}) => {
  const [workStart, setWorkStart] = useState(config.workStart);
  const [workEnd, setWorkEnd] = useState(config.workEnd);
  const [lunchStart, setLunchStart] = useState(config.lunchStart);
  const [lunchEnd, setLunchEnd] = useState(config.lunchEnd);
  const [bufferMinutes, setBufferMinutes] = useState(config.bufferMinutes);
  const [energyCurveOptimization, setEnergyCurveOptimization] = useState(config.energyCurveOptimization);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      workStart,
      workEnd,
      lunchStart,
      lunchEnd,
      bufferMinutes,
      energyCurveOptimization,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Working Hours & Scheduler Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Work Window */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standard Daily Work Hours</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">Day Start</span>
                <input
                  type="time"
                  value={workStart}
                  onChange={e => setWorkStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">Day End</span>
                <input
                  type="time"
                  value={workEnd}
                  onChange={e => setWorkEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Lunch Break */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Protected Lunch & Recharge Window</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">Lunch Start</span>
                <input
                  type="time"
                  value={lunchStart}
                  onChange={e => setLunchStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">Lunch End</span>
                <input
                  type="time"
                  value={lunchEnd}
                  onChange={e => setLunchEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Buffer Minutes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cognitive Transition Buffer Between Tasks
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map(mins => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setBufferMinutes(mins)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    bufferMinutes === mins
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mins === 0 ? 'None' : `${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Curve Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={energyCurveOptimization}
                onChange={e => setEnergyCurveOptimization(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>Smart Energy Curve: Slot Deep Work in Morning</span>
            </label>
          </div>

          {/* Preset / Data Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset task backlog to sample data?')) {
                  onResetToSampleTasks();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Tasks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all tasks from the app?')) {
                  onClearAllTasks();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Backlog</span>
            </button>
          </div>

          {/* Actions */}
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
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
