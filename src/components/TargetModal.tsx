import React, { useState, useEffect } from 'react';
import { Target, X } from 'lucide-react';
import { Language, TranslationSet, translations, Targets } from '../types';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: Targets;
  onSave: (targets: Targets) => void;
  language: Language;
}

export default function TargetModal({
  isOpen,
  onClose,
  currentTargets,
  onSave,
  language,
}: TargetModalProps) {
  const t: TranslationSet = translations[language];

  // Component state variables to hold currently typed values
  const [dailyVal, setDailyVal] = useState<string>('');
  const [monthlyVal, setMonthlyVal] = useState<string>('');

  // Synchronize state when the targets or openness changes
  useEffect(() => {
    if (isOpen) {
      setDailyVal(currentTargets.daily.toString());
      setMonthlyVal(currentTargets.monthly.toString());
    }
  }, [isOpen, currentTargets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dNum = parseFloat(dailyVal) || 0;
    const mNum = parseFloat(monthlyVal) || 0;
    onSave({
      daily: Math.max(0, dNum),
      monthly: Math.max(0, mNum),
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      id="targets-modal-overlay"
    >
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main bottom-sheet / modal card container */}
      <div 
        className="relative w-full max-w-md bg-[#111926] border-t sm:border border-[#2d3a4f] rounded-t-[28px] sm:rounded-[32px] p-6 text-white shadow-2xl z-10 animate-slide-up"
        id="targets-modal-container"
      >
        {/* Visual grab bar for PWA mobile feeling */}
        <div className="mx-auto w-12 h-1 bg-[#2d3a4f]/70 rounded-full mb-5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400">
            <Target className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.setTargetsTitle}
          </h2>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Daily Target */}
          <div>
            <label className="block text-[11px] font-bold text-[#8a99ad] tracking-widest uppercase mb-2">
              {t.dailyTargetLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="5 animate"
                value={dailyVal}
                onChange={(e) => setDailyVal(e.target.value)}
                className="w-full bg-[#1e293b]/70 border border-[#2d3a4f] hover:border-[#3b4b66] focus:border-emerald-500 rounded-2xl py-3.5 pl-5 pr-12 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                placeholder="0"
                required
                id="input-daily-target"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[#8a99ad] text-lg">
                €
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1.5 pl-1 italic font-medium">
              {language === 'ES' ? 'Afecta a la barra de progreso de HOY.' : 'Reflects on TODAY progress bar.'}
            </p>
          </div>

          {/* Monthly Target */}
          <div>
            <label className="block text-[11px] font-bold text-[#8a99ad] tracking-widest uppercase mb-2">
              {t.monthlyTargetLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyVal}
                onChange={(e) => setMonthlyVal(e.target.value)}
                className="w-full bg-[#1e293b]/70 border border-[#2d3a4f] hover:border-[#3b4b66] focus:border-emerald-500 rounded-2xl py-3.5 pl-5 pr-12 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                placeholder="0"
                required
                id="input-monthly-target"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[#8a99ad] text-lg">
                €
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1.5 pl-1 italic font-medium">
              {language === 'ES' ? 'Afecta a la barra de progreso TOTAL.' : 'Reflects on TOTAL progress bar.'}
            </p>
          </div>

          {/* Dialog Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
              id="btn-save-targets"
            >
              {t.saveTargetsBtn}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#1e293b]/50 hover:bg-[#1e293b] text-[#cbd5e1] border border-[#2d3a4f] font-bold text-sm py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer"
              id="btn-cancel-targets"
            >
              {t.cancelBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
