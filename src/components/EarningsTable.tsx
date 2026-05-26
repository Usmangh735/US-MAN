import React, { useState } from 'react';
import { Pencil, Trash2, PlusCircle, AlertCircle, Check } from 'lucide-react';
import { Language, TranslationSet, translations, EarningItem, Platform } from '../types';

interface EarningsTableProps {
  earningsData: EarningItem[];
  platforms: Platform[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  language: Language;
  onEditDay: (dateStr: string) => void;
  onClearDay: (dateStr: string) => void;
}

export default function EarningsTable({
  earningsData,
  platforms,
  selectedDate,
  onSelectDate,
  language,
  onEditDay,
  onClearDay,
}: EarningsTableProps) {
  const t: TranslationSet = translations[language];
  const [confirmDeleteDate, setConfirmDeleteDate] = useState<string | null>(null);

  // Filter only enabled platforms to construct headers & row offsets
  const activePlatforms = platforms.filter((p) => p.enabled);

  // Safe percentage calculations for value formatters
  const formatCurrencyValue = (val: number) => {
    // Show 60,60 format instead of 60.6
    const value = val || 0;
    return value.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Extract day number for the circle badge
  const getDayNumberStr = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return parts[2];
    }
    return dateStr;
  };

  // Compile overall sums
  let ledgerSum = 0;
  earningsData.forEach((item) => {
    activePlatforms.forEach((p) => {
      ledgerSum += item.earnings[p.id] || 0;
    });
  });

  return (
    <div className="space-y-4" id="ledger-table-container">
      {/* Scrollable table wrapper */}
      <div className="bg-[#111926]/40 border border-[#2d3a4f]/50 rounded-[28px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              {/* Header row matched with table layout styled in mockup 1 */}
              <tr className="border-b border-[#2d3a4f]/60 text-[#8a99ad] text-[10px] sm:text-[11px] font-black tracking-widest uppercase">
                <th className="py-2.5 pl-6 pr-2 text-left w-16">{t.dateCol}</th>
                {activePlatforms.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 text-right">
                    {p.name}
                  </th>
                ))}
                <th className="py-2.5 pl-3 pr-6 text-right text-emerald-400 font-extrabold">{t.totalCol}</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#2d3a4f]/35">
              {earningsData
                .filter((item) => {
                  let rowSum = 0;
                  activePlatforms.forEach((p) => {
                    rowSum += item.earnings[p.id] || 0;
                  });
                  const hasExpenses = (item.expenses || 0) > 0;
                  const hasNotes = !!(item.notes && item.notes.trim());
                  return rowSum > 0 || hasExpenses || hasNotes;
                })
                .map((item) => {
                  const isSelected = selectedDate === item.date;
                  const dayNum = getDayNumberStr(item.date);

                // Calculate horizontal total for active platforms
                let rowSum = 0;
                activePlatforms.forEach((p) => {
                  rowSum += item.earnings[p.id] || 0;
                });

                return (
                  <tr
                    key={item.date}
                    onClick={() => {
                      onSelectDate(item.date);
                      onEditDay(item.date);
                    }}
                    onMouseLeave={() => setConfirmDeleteDate(null)}
                    className={`group transition-all hover:bg-[#1e293b]/40 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#121925] border-l-2 border-amber-500' 
                        : ''
                    }`}
                    id={`table-row-${item.date}`}
                  >
                    {/* Date Pill Cell */}
                    <td 
                      className="py-1.5 pl-6 pr-2 text-left"
                    >
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg font-black text-xs tracking-tight transition-all duration-200 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                            : 'bg-[#1e293b]/80 text-[#cbd5e1] border border-[#2d3a4f]/50'
                        }`}
                        id={`date-pill-btn-${dayNum}`}
                      >
                        <span className="font-bold text-xs block">
                          {dayNum}
                        </span>
                      </button>
                    </td>

                    {/* Earnings values columns by platform */}
                    {activePlatforms.map((p) => {
                      const amount = item.earnings[p.id] || 0;
                      return (
                        <td
                          key={p.id}
                          className={`py-1.5 px-3 text-right text-xs sm:text-sm font-extrabold tracking-tight ${
                            isSelected 
                              ? 'text-amber-400' 
                              : amount > 0 
                              ? 'text-[#e2e8f0]' 
                              : 'text-[#475569]'
                          }`}
                        >
                          {amount > 0 ? formatCurrencyValue(amount) : '0,00'}
                        </td>
                      );
                    })}

                    {/* Row Total Accumulator Cell */}
                    <td className="py-1.5 pl-3 pr-6 text-right">
                      <span
                        className={`text-xs sm:text-sm font-black tracking-tight transition-all duration-150 ${
                          isSelected
                            ? 'text-amber-400 font-black'
                            : rowSum > 0
                            ? 'text-emerald-400'
                            : 'text-[#334155]'
                        }`}
                      >
                        {formatCurrencyValue(rowSum)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty records checklist backup */}
        {earningsData.length === 0 && (
          <div className="py-12 text-center text-xs text-[#64748b] flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-indigo-500/60" />
            <span>{t.noData}</span>
          </div>
        )}
      </div>

      {/* Ledger bottom footer directly showing the requested TOTAL */}
      <div 
        className="flex items-center justify-center p-6 bg-[#111926]/60 border border-[#2d3a4f]/45 rounded-2.5xl shadow-xl mt-4"
        id="ledger-sum-footer"
      >
        <span className="text-xl font-black text-white font-sans" id="ledger-sum-value">
          TOTAL = <span className="text-emerald-400 font-extrabold">{formatCurrencyValue(ledgerSum)} €</span>
        </span>
      </div>

    </div>
  );
}
