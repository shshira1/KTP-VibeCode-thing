import React, { useState } from 'react';
import { ScheduleConfig } from '../types/schedule';
import { timeToMinutes, minutesToTime, formatTimeDisplay } from '../utils/scheduler';
import { X, RefreshCw, AlertCircle, Sun, Coffee, Clock } from 'lucide-react';

interface RebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScheduleConfig;
  onConfirmRebalance: (timeStr: string) => void;
}

export const RebalanceModal: React.FC<RebalanceModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfirmRebalance,
}) => {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const currentTimeStr = minutesToTime(currentMins);
  const workEndMins = timeToMinutes(config.workEnd);
  const remainingMinsToday = Math.max(0, workEndMins - currentMins);

  const [selectedTime, setSelectedTime] = useState(currentTimeStr);

  if (!isOpen) return null;

  const isNearEndOfDay = remainingMinsToday < 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Rebalance Remaining Schedule
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice if time is near end of day */}
        {isNearEndOfDay && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice: Current time is {formatTimeDisplay(currentTimeStr)}.</span>
              <p className="text-amber-200/80 mt-0.5">
                Your workday ends at {formatTimeDisplay(config.workEnd)} ({remainingMinsToday} mins left). Rebalancing from right now will only fit tasks that can finish before {formatTimeDisplay(config.workEnd)}.
              </p>
            </div>
          </div>
        )}

        {/* Rebalance Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Select Rebalance Starting Point:
          </label>

          <div className="grid grid-cols-1 gap-2">
            
            {/* Current Real Time */}
            <button
              type="button"
              onClick={() => setSelectedTime(currentTimeStr)}
              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                selectedTime === currentTimeStr
                  ? 'border-indigo-500 bg-indigo-950/40 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold">Current Time ({formatTimeDisplay(currentTimeStr)})</div>
                  <div className="text-[10px] text-slate-400">
                    {remainingMinsToday > 0 ? `${remainingMinsToday} mins remaining today` : 'Workday ended'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300">Live</span>
            </button>

            {/* Mid-Morning preset */}
            <button
              type="button"
              onClick={() => setSelectedTime('11:00')}
              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                selectedTime === '11:00'
                  ? 'border-indigo-500 bg-indigo-950/40 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold">Mid-Morning (11:00 AM)</div>
                  <div className="text-[10px] text-slate-400">
                    Keeps 8:00 AM – 11:00 AM tasks locked, recalculates the rest
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">Preset</span>
            </button>

            {/* Post-Lunch preset */}
            <button
              type="button"
              onClick={() => setSelectedTime(config.lunchEnd || '13:00')}
              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                selectedTime === (config.lunchEnd || '13:00')
                  ? 'border-indigo-500 bg-indigo-950/40 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold">Post-Lunch ({formatTimeDisplay(config.lunchEnd || '13:00')})</div>
                  <div className="text-[10px] text-slate-400">
                    Keeps entire morning & lunch locked, recalculates afternoon
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">Preset</span>
            </button>

          </div>
        </div>

        {/* Custom Time Input */}
        <div>
          <label className="block text-[11px] text-slate-400 mb-1 font-mono">
            Or Choose Custom Start Time:
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
          />
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
            type="button"
            onClick={() => {
              onConfirmRebalance(selectedTime);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            Rebalance Schedule
          </button>
        </div>

      </div>
    </div>
  );
};
