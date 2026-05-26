import React, { useState } from 'react';
import { AreaChart, DollarSign, ArrowUpRight, ShieldAlert, Award, CalendarDays, Download, X, Calendar } from 'lucide-react';
import { Language, TranslationSet, translations, EarningItem, Platform } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  earningsData: EarningItem[];
  platforms: Platform[];
  language: Language;
}

export default function StatsModal({
  isOpen,
  onClose,
  earningsData,
  platforms,
  language,
}: StatsModalProps) {
  const t: TranslationSet = translations[language];

  // Dynamic range boundaries defaulted to cover May 2026 pre-populated logs
  const [startDate, setStartDate] = useState<string>('2026-05-01');
  const [endDate, setEndDate] = useState<string>('2026-05-31');

  if (!isOpen) return null;

  // Format YYYY-MM-DD to DD/MM/YY with parentheses e.g. (01/05/26)
  const formatDateCompact = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const yy = parts[0].substring(2);
    const mm = parts[1];
    const dd = parts[2];
    return `(${dd}/${mm}/${yy})`;
  };

  // Filter daily list by custom selected range
  const filteredData = earningsData.filter((item) => {
    return item.date >= startDate && item.date <= endDate;
  });

  // Compile calculations from filtered data
  let grossEarnings = 0;
  let totalExpenses = 0;
  let workingDaysCount = 0;

  // Let's create an accumulator for enabled platforms
  const platformEarningsAcc: Record<string, number> = {
    taxi: 0,
    uber: 0,
    cabify: 0,
    bolt: 0,
  };

  filteredData.forEach((day) => {
    let dayHasEarnings = false;
    platforms.forEach((p) => {
      const amount = day.earnings[p.id] || 0;
      if (amount > 0) {
        platformEarningsAcc[p.id] += amount;
        grossEarnings += amount;
        dayHasEarnings = true;
      }
    });

    totalExpenses += day.expenses || 0;

    if (dayHasEarnings) {
      workingDaysCount += 1;
    }
  });

  const netProfit = grossEarnings - totalExpenses;
  const averageDaily = workingDaysCount > 0 ? Math.round(grossEarnings / workingDaysCount) : 0;

  // Function to simulate exporting as detailed PDF statement
  const handleExportPDF = () => {
    // We can open the default browser window.print() or alert a professional success alert.
    // Let's print out a clean diagnostic print layout!
    window.print();
  };

  // Safe decimal formatted values
  const formatCurrency = (val: number) => {
    // E.g. 6.400 € instead of 6400
    const formatted = val.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatted} €`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fade-in"
      id="stats-report-overlay"
    >
      {/* Tap outer dark background to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Report sheet container */}
      <div 
        className="relative w-full max-w-md bg-[#111926] border border-[#2d3a4f] rounded-[32px] p-6 text-white shadow-2xl z-10 max-h-[92vh] overflow-y-auto no-scrollbar"
        id="stats-report-container"
      >
        {/* Mockup "Generate" action badge */}
        <div className="w-full text-center py-2.5 mb-4 bg-gradient-to-r from-blue-600/35 to-indigo-600/35 border border-indigo-400/20 text-[#93c5fd] font-bold text-[11px] tracking-widest rounded-2xl uppercase font-sans">
          {t.generatingReport}
        </div>

        {/* Date Selection Range Section (Custom box with formatted date representation DD/MM/YY) */}
        <div className="bg-[#1e293b]/45 border border-[#2d3a4f] rounded-2xl p-4 mb-4 space-y-3">
          <span className="block text-[10px] font-black text-[#8a99ad] tracking-widest uppercase pl-0.5">
            {language === 'ES' ? 'FILTRAR POR RANGO DE FECHAS' : 'FILTER BY DATE RANGE'}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Start Date Box */}
            <div className="flex-1 bg-[#111926] border border-[#2d3a4f]/70 hover:border-indigo-400/60 focus-within:border-indigo-400 rounded-xl p-2.5 transition-all text-left">
              <span className="block text-[8px] text-[#8a99ad] hover:text-indigo-400/80 uppercase font-mono tracking-widest">
                {language === 'ES' ? 'DESDE' : 'FROM'}
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 text-white font-black text-xs tracking-tight focus:outline-none w-full cursor-pointer mt-0.5"
                id="filter-start-date"
              />
              <span className="block text-[10px] font-mono text-indigo-300 font-bold mt-1">
                {formatDateCompact(startDate)}
              </span>
            </div>

            <span className="text-[#64748b] font-black text-xs px-0.5">—</span>

            {/* End Date Box */}
            <div className="flex-1 bg-[#111926] border border-[#2d3a4f]/70 hover:border-indigo-400/60 focus-within:border-indigo-400 rounded-xl p-2.5 transition-all text-left">
              <span className="block text-[8px] text-[#8a99ad] hover:text-indigo-400/80 uppercase font-mono tracking-widest">
                {language === 'ES' ? 'HASTA' : 'TO'}
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 text-white font-black text-slate-100 text-xs tracking-tight focus:outline-none w-full cursor-pointer mt-0.5"
                id="filter-end-date"
              />
              <span className="block text-[10px] font-mono text-indigo-300 font-bold mt-1">
                {formatDateCompact(endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Modular Grid Dashboard */}
        <div className="space-y-4">
          
          {/* Row 1: Earnings & Expenses */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Direct Earnings Card */}
            <div className="bg-[#1e293b]/40 border border-[#2d3a4f] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase">
                {t.earningsTitle}
              </span>
              <span className="text-[20px] font-black text-emerald-400 tracking-tight leading-none mt-3.5 block font-sans">
                {formatCurrency(grossEarnings)}
              </span>
            </div>

            {/* Expenses Card */}
            <div className="bg-[#1e293b]/40 border border-[#2d3a4f] rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase">
                {t.expensesTitle}
              </span>
              <span className="text-[20px] font-black text-rose-400 tracking-tight leading-none mt-3.5 block font-sans">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          {/* Net Profit Card spanning full width */}
          <div className="bg-[#1e293b]/70 border border-[#2d3a4f] rounded-2xl p-5">
            <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase block mb-1">
              {t.netProfitTitle}
            </span>
            <span className="text-[28px] font-black text-emerald-300 tracking-tight leading-none font-sans block pt-1">
              {formatCurrency(netProfit)}
            </span>
          </div>

          {/* Row 3: Working Days & Daily Avg */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Working Days Card */}
            <div className="bg-[#1e293b]/40 border border-[#2d3a4f] rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase block leading-tight">
                {t.workingDaysTitle}
              </span>
              <span className="text-[24px] font-black text-white tracking-tight leading-none mt-3.5 block font-sans">
                {workingDaysCount}
              </span>
            </div>

            {/* Daily Avg Card */}
            <div className="bg-[#1e293b]/40 border border-[#2d3a4f] rounded-2xl p-4">
              <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase block leading-tight">
                {t.dailyAvgTitle}
              </span>
              <span className="text-[24px] font-black text-white tracking-tight leading-none mt-3.5 block font-sans">
                {formatCurrency(averageDaily)}
              </span>
            </div>
          </div>

          {/* Platform breakdown */}
          <div className="bg-[#1e293b]/40 border border-[#2d3a4f] rounded-2xl p-5" id="stats-platform-breakdown">
            <span className="text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase block mb-3.5">
              {t.byPlatformTitle}
            </span>
            
            <div className="space-y-3 font-sans">
              {platforms.filter(p => p.enabled).map((plat) => {
                const percentage = grossEarnings > 0 
                  ? Math.round(((platformEarningsAcc[plat.id] || 0) / grossEarnings) * 100) 
                  : 0;

                return (
                  <div key={plat.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold text-[#cbd5e1]">
                      <span>{plat.name}</span>
                      <span className="text-white font-bold">{formatCurrency(platformEarningsAcc[plat.id] || 0)}</span>
                    </div>
                    {/* Compact platform share bar */}
                    <div className="w-full bg-[#111926] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: plat.color 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
              {platforms.filter(p => p.enabled).length === 0 && (
                <p className="text-xs text-[#64748b] text-center py-2 italic">
                  No active platforms selected.
                </p>
              )}
            </div>
          </div>
          
          {/* PDF and Close actions */}
          <div className="space-y-2 pt-3">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 border border-[#2d3a4f] hover:border-emerald-500 text-white font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 bg-[#1e293b]/30"
              id="report-pdf-btn"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {t.exportPdfBtn}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-[#1e293b]/90 hover:bg-[#1e293b] border border-[#2d3a4f] text-[#cbd5e1] font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer"
              id="report-close-btn"
            >
              {t.closeBtn}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
