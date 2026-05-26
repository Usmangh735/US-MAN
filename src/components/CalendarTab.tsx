import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, HelpCircle, Hammer, ShieldAlert } from 'lucide-react';
import { Language, TranslationSet, translations, DriverPreferences } from '../types';
import { calculateTaxiDayStatus, getStatusStyleAndLabel } from '../lib/taxiRules';

interface CalendarTabProps {
  preferences: DriverPreferences;
  onPreferencesChange: (prefs: DriverPreferences) => void;
  language: Language;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export default function CalendarTab({
  preferences,
  onPreferencesChange,
  language,
  selectedDate,
  onSelectDate,
}: CalendarTabProps) {
  const t: TranslationSet = translations[language];

  // Store active month and year to browse
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed, so 4 is May

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleFixedDayToggle = (day: 'L' | 'M' | 'X' | 'J' | 'V') => {
    onPreferencesChange({
      ...preferences,
      fixedDayOff: preferences.fixedDayOff === day ? null : day,
    });
  };

  const handleDigitChange = (digit: number) => {
    onPreferencesChange({
      ...preferences,
      licenseDigit: digit,
    });
  };

  // Helper arrays for calendar generation
  const weekdayNames =
    language === 'ES'
      ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
      : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Madrid Holidays list for 2026
  // Format: "YYYY-MM-DD"
  const madridHolidays2026: Record<string, string> = {
    '2026-01-01': 'Año Nuevo',
    '2026-01-06': 'Epifanía del Señor',
    '2026-03-19': 'San José',
    '2026-04-02': 'Jueves Santo',
    '2026-04-03': 'Viernes Santo',
    '2026-05-01': 'Fiesta del Trabajo',
    '2026-05-02': 'Fiesta de la Comunidad de Madrid',
    '2026-05-15': 'San Isidro Labrador',
    '2026-08-15': 'Asunción de la Virgen',
    '2026-10-12': 'Fiesta Nacional de España',
    '2026-11-02': 'Traslado de Todos los Santos',
    '2026-11-09': 'Día de la Almudena',
    '2026-12-08': 'Inmaculada Concepción',
    '2026-12-25': 'Natividad del Señor',
  };

  // Get days in monthly grid layout
  const getDaysInMonthGrid = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sun=0, Mon=1...
    // In Spanish layout: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const grid = [];
    // Pad previous month spacing
    for (let i = 0; i < adjustedFirstDay; i++) {
      grid.push(null);
    }
    // Add real days of month
    for (let day = 1; day <= totalDays; day++) {
      grid.push(day);
    }
    return grid;
  };

  // Madrid Taxi Status Determination Rule
  // Highly accurate calculation based on custom preferences and priority rules
  const getDayStatus = (day: number) => {
    const doubleDigitsMonth = (currentMonth + 1).toString().padStart(2, '0');
    const doubleDigitsDay = day.toString().padStart(2, '0');
    const fullDateStr = `${currentYear}-${doubleDigitsMonth}-${doubleDigitsDay}`;

    const calculatedStatus = calculateTaxiDayStatus(fullDateStr, preferences);
    const renderStyle = getStatusStyleAndLabel(calculatedStatus, language, fullDateStr);

    return {
      type: calculatedStatus === 'Full Libranza' ? 'libranza' : calculatedStatus === 'Partial Libranza (Work after 20:00)' ? 'refuerzo' : 'work',
      label: renderStyle.label,
      style: renderStyle.style
    };
  };

  const getMonthName = () => {
    const monthNamesEN = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesES = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const currentName =
      language === 'ES'
        ? monthNamesES[currentMonth]
        : monthNamesEN[currentMonth];

    return `${currentName} ${currentYear}`;
  };

  const calendarDays = getDaysInMonthGrid();

  const fixedDayOffButtons: ('L' | 'M' | 'X' | 'J' | 'V')[] = ['L', 'M', 'X', 'J', 'V'];

  return (
    <div className="space-y-6 pt-3" id="calendar-view-tab">
      
      {/* 1. Fixed Day Off config area */}
      <div className="bg-[#1e293b]/30 border border-[#2d3a4f]/70 rounded-[24px] p-5">
        <label className="block text-[11px] font-black text-[#8a99ad] tracking-widest uppercase mb-1">
          {t.fixedDayOffTitle}
        </label>
        <p className="text-[10px] text-[#64748b] leading-relaxed mb-4">
          {t.fixedDayOffSub}
        </p>

        {/* L M X J V Selection block */}
        <div className="flex gap-2">
          {fixedDayOffButtons.map((day) => {
            const isActive = preferences.fixedDayOff === day;
            return (
              <button
                key={day}
                onClick={() => handleFixedDayToggle(day)}
                className={`flex-1 aspect-square sm:max-h-12 flex items-center justify-center font-black rounded-xl border text-sm transition-all duration-200 cursor-pointer active:scale-90 ${
                  isActive
                    ? 'bg-rose-500 text-white border-rose-400 font-extrabold shadow-lg shadow-rose-500/20 scale-105'
                    : 'bg-[#111926] border-[#2d3a4f] text-[#cbd5e1] hover:border-[#3b4b66]'
                }`}
                id={`btn-fixed-off-${day}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* License ID/Number Input to derive even/odd logic automatically */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#2d3a4f]/40 pt-4 gap-3">
          <div className="flex-1">
            <label htmlFor="input-license-number" className="text-xs font-black text-[#cbd5e1] block mb-1">
              {t.licenseDigitLabel}
            </label>
            <span className="text-[10px] text-[#8a99ad] leading-snug block">
              {t.licenseDigitSub}
            </span>
          </div>
          
          <div className="relative shrink-0 flex items-center bg-[#111926] border border-[#2d3a4f]/80 rounded-2xl px-3 py-1.5 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
            <input
              id="input-license-number"
              type="text"
              placeholder="e.g. 15433"
              className="bg-transparent text-white font-extrabold text-sm focus:outline-none w-28 uppercase tracking-wider text-center"
              value={preferences.licenseNumber ?? preferences.licenseDigit.toString()}
              onChange={(e) => {
                const rawValue = e.target.value;
                // find last numeric digit
                const digits = rawValue.replace(/\D/g, '');
                let lastDigit = preferences.licenseDigit;
                if (digits.length > 0) {
                  lastDigit = parseInt(digits.slice(-1), 10);
                }
                onPreferencesChange({
                  ...preferences,
                  licenseNumber: rawValue,
                  licenseDigit: lastDigit,
                });
              }}
            />
            <span className="ml-2 font-mono text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-1 rounded-lg border border-indigo-500/20 uppercase font-black">
              {preferences.licenseDigit % 2 === 0 ? (language === 'ES' ? 'PAR' : 'EVEN') : (language === 'ES' ? 'IMPAR' : 'ODD')} ({preferences.licenseDigit})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Calendar Block Grid (May 2026) */}
      <div className="bg-[#1e293b]/30 border border-[#2d3a4f]/70 rounded-[28px] p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider pl-0.5">
            {t.madridCalendarTitle} — {currentYear}
          </h3>

          {/* Month Steppers */}
          <div className="flex items-center gap-1 bg-[#111926] rounded-xl p-0.5 border border-[#2d3a4f]/70">
            <button
              onClick={handlePrevMonth}
              className="p-1 px-2.5 text-[#cbd5e1] hover:text-white transition-all cursor-pointer rounded-lg active:scale-95"
              id="btn-calendar-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-extrabold text-white px-2 tracking-wide text-center min-w-[75px]">
              {getMonthName().split(' ')[0]}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 px-2.5 text-[#cbd5e1] hover:text-white transition-all cursor-pointer rounded-lg active:scale-95"
              id="btn-calendar-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Columns titles L, M, X, J, V, S, D */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-3">
          {weekdayNames.map((name, i) => (
            <span
              key={i}
              className="text-[10px] font-black text-[#52637a] uppercase tracking-wider block py-1 font-mono"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Days grid container */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square opacity-0 pointer-events-none" />;
            }

            // Calculate the date-string representation YYYY-MM-DD
            const doubleDigitsMonth = (currentMonth + 1).toString().padStart(2, '0');
            const doubleDigitsDay = day.toString().padStart(2, '0');
            const dateStr = `${currentYear}-${doubleDigitsMonth}-${doubleDigitsDay}`;

            const isSelected = selectedDate === dateStr;
            const status = getDayStatus(day);

            return (
              <button
                key={`day-${day}`}
                onClick={() => onSelectDate(dateStr)}
                className={`relative aspect-square rounded-2xl flex flex-col justify-center items-center transition-all duration-150 cursor-pointer text-xs font-bold border ${status.style} ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111926] scale-105 z-10'
                    : 'hover:scale-105 hover:brightness-110'
                }`}
                id={`calendar-day-node-${day}`}
                title={`${day}: ${status.label}`}
              >
                {/* Visual day number display */}
                <span className="text-sm font-extrabold leading-none">{day}</span>
                
                {/* Madrid (20+) label overlay mimicry on pink circles */}
                {status.type === 'libranza' && (
                  <span className="text-[7px] block font-mono leading-none tracking-tighter opacity-80 pt-0.5">
                    20+
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legends map */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#2d3a4f]/70 mt-6 pt-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8a99ad]">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 inline-block block shrink-0" />
            <span>{t.legendWorkDay}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8a99ad]">
            <span className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-400/40 inline-block block shrink-0" />
            <span>{t.legendLibranza}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8a99ad]">
            <span className="w-4 h-4 rounded-full bg-amber-500/25 border border-amber-400/50 inline-block block shrink-0" />
            <span>{t.legendRefuerzo}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8a99ad]">
            <span className="w-4 h-4 rounded-full bg-indigo-600/35 border border-indigo-500/40 inline-block block shrink-0" />
            <span>{t.legendHoliday}</span>
          </div>
        </div>

      </div>



    </div>
  );
}
