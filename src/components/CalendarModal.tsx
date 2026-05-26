import React from 'react';
import { CalendarRange, X } from 'lucide-react';
import { Language, DriverPreferences } from '../types';
import CalendarTab from './CalendarTab';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: DriverPreferences;
  onPreferencesChange: (prefs: DriverPreferences) => void;
  language: Language;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
  preferences,
  onPreferencesChange,
  language,
  selectedDate,
  onSelectDate,
}: CalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm transition-all duration-300 animate-fade-in"
      id="calendar-modal-overlay"
    >
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main bottom-sheet / modal card container */}
      <div 
        className="relative w-full max-w-lg bg-[#0e1626] border-t sm:border border-[#2d3a4f] rounded-t-[32px] sm:rounded-[36px] text-white shadow-2xl z-10 animate-slide-up flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        id="calendar-modal-container"
      >
        {/* Visual grab bar for mobile */}
        <div className="mx-auto w-12 h-1.5 bg-[#2d3a4f]/70 rounded-full mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d3a4f]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 text-purple-400">
              <CalendarRange className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                {language === 'ES' ? 'Descansos y Calendario' : 'Descansos & Calendario'}
              </h2>
              <p className="text-[10px] text-[#8a99ad] uppercase tracking-widest font-mono">
                Madrid Taxi PWA
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1e293b]/50 border border-[#2d3a4f]/50 text-[#cbd5e1] hover:text-white transition-all active:scale-90"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable content area */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-4">
          <CalendarTab 
            preferences={preferences}
            onPreferencesChange={onPreferencesChange}
            language={language}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </div>

        {/* Bottom Actions footer */}
        <div className="p-5 border-t border-[#2d3a4f]/40 bg-[#0b1120] shrink-0 text-center rounded-b-[36px]">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/10 active:scale-95"
          >
            {language === 'ES' ? 'Aceptar' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
