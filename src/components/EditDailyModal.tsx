import React, { useState, useEffect } from 'react';
import { PencilLine, X, Landmark, Receipt, HelpCircle, Trash2, Calendar } from 'lucide-react';
import { Language, TranslationSet, translations, EarningItem, Platform } from '../types';

interface EditDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  onDateChange?: (dateStr: string) => void;
  activePlatforms: Platform[];
  currentEntry: EarningItem | null;
  onSave: (entry: EarningItem) => void;
  onDelete?: (dateStr: string) => void;
  language: Language;
}

export default function EditDailyModal({
  isOpen,
  onClose,
  dateStr,
  onDateChange,
  activePlatforms,
  currentEntry,
  onSave,
  onDelete,
  language,
}: EditDailyModalProps) {
  const t: TranslationSet = translations[language];

  // Map state to forms
  const [platformAmts, setPlatformAmts] = useState<Record<string, string>>({});
  const [expensesAmt, setExpensesAmt] = useState<string>('0');
  const [notesStr, setNotesStr] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [initialValues, setInitialValues] = useState<{
    platformAmts: Record<string, string>;
    expensesAmt: string;
    notesStr: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmDelete(false);
      const initialAmts: Record<string, string> = {};
      activePlatforms.forEach((p) => {
        const value = currentEntry ? currentEntry.earnings[p.id] || 0 : 0;
        initialAmts[p.id] = value > 0 ? value.toString() : '';
      });

      const exp = currentEntry ? (currentEntry.expenses || 0).toString() : '0';
      const nts = currentEntry ? currentEntry.notes || '' : '';

      setPlatformAmts(initialAmts);
      setExpensesAmt(exp);
      setNotesStr(nts);

      setInitialValues({
        platformAmts: initialAmts,
        expensesAmt: exp,
        notesStr: nts,
      });
    } else {
      setInitialValues(null);
    }
  }, [isOpen, currentEntry, activePlatforms, dateStr]);

  if (!isOpen) return null;

  const hasChanges = () => {
    if (!initialValues) return false;

    for (const p of activePlatforms) {
      const initVal = initialValues.platformAmts[p.id] || '';
      const currVal = platformAmts[p.id] || '';
      if (initVal !== currVal) return true;
    }

    if (expensesAmt !== initialValues.expensesAmt) return true;
    if (notesStr !== initialValues.notesStr) return true;

    return false;
  };

  const handleAmtChange = (id: string, val: string) => {
    setPlatformAmts((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const compiledEarnings: Record<string, number> = {
      taxi: 0,
      uber: 0,
      cabify: 0,
      bolt: 0,
    };

    activePlatforms.forEach((p) => {
      compiledEarnings[p.id] = parseFloat(platformAmts[p.id]) || 0;
    });

    const expensesVal = parseFloat(expensesAmt) || 0;

    const updatedEntry: EarningItem = {
      date: dateStr,
      earnings: compiledEarnings as any,
      expenses: Math.max(0, expensesVal),
      notes: notesStr,
    };

    onSave(updatedEntry);
    onClose();
  };

  const formatDateLabel = () => {
    const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsES = ['de Enero', 'de Febrero', 'de Marzo', 'de Abril', 'de Mayo', 'de Junio', 'de Julio', 'de Agosto', 'de Septiembre', 'de Octubre', 'de Noviembre', 'de Diciembre'];

    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (language === 'ES') {
      return `${day} ${monthsES[monthIndex]} ${year}`;
    }
    return `${monthsEN[monthIndex]} ${day}, ${year}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      id="edit-daily-overlay"
    >
      {/* Tap outside to cancel */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative w-full max-w-md bg-[#111926] border-t sm:border border-[#2d3a4f] rounded-t-[28px] sm:rounded-[32px] p-6 text-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
        id="edit-daily-container"
      >
        {/* Mobile grab rail */}
        <div className="mx-auto w-12 h-1 bg-[#2d3a4f]/70 rounded-full mb-5 sm:hidden" />

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400">
              <PencilLine className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none text-white">
                {language === 'ES' ? 'Registrar Jornada' : 'Log Shift Earnings'}
              </h2>
              <p className="text-[11px] font-sans font-bold text-[#8a99ad] mt-1 tracking-wider uppercase">
                {formatDateLabel()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentEntry && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete) {
                    onDelete(dateStr);
                    onClose();
                  } else {
                    setConfirmDelete(true);
                  }
                }}
                onMouseLeave={() => setConfirmDelete(false)}
                className={`h-9 flex items-center justify-center rounded-xl font-bold transition-all duration-300 cursor-pointer text-xs ${
                  confirmDelete
                    ? 'bg-rose-600 text-white px-3 border border-rose-500 shadow-lg shadow-rose-600/25 animate-pulse'
                    : 'w-9 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20'
                }`}
                title={language === 'ES' ? 'Borrar registro' : 'Delete record'}
                id="header-delete-btn"
              >
                <Trash2 className="w-4 h-4" />
                {confirmDelete && (
                  <span className="ml-1.5 font-bold whitespace-nowrap text-[10px] uppercase">
                    {language === 'ES' ? '¿Borrar?' : 'Delete?'}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1e293b]/60 hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#2d3a4f]/50 active:scale-90 transition-all duration-200 cursor-pointer"
              aria-label="Close"
              id="header-close-btn"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Shift Date Selector */}
          {onDateChange && (
            <div>
              <label htmlFor="input-daily-date" className="block text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase pl-0.5 mb-2 font-mono">
                {language === 'ES' ? 'FECHA DE REGISTRO' : 'SHIFT DATE'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="input-daily-date"
                  value={dateStr}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-[#2d3a4f] hover:border-[#3b4b66] focus:border-emerald-500 rounded-2xl py-3.5 pl-5 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans cursor-pointer [color-scheme:dark]"
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Platforms Earnings inputs block */}
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase pl-0.5">
              {language === 'ES' ? 'INGRESOS POR PLATAFORMA' : 'EARNINGS BY PLATFORM'}
            </span>

            {activePlatforms.map((plat) => (
              <div key={plat.id} className="relative flex items-center justify-between bg-[#1e293b]/50 border border-[#2d3a4f] hover:border-[#3b4b66] transition-colors rounded-2xl p-3">
                <span className="text-sm font-bold text-[#cbd5e1] font-sans flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plat.color }} />
                  {plat.name}
                </span>

                <div className="relative w-1/2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.00"
                    value={platformAmts[plat.id] || ''}
                    onChange={(e) => handleAmtChange(plat.id, e.target.value)}
                    className="w-full text-right bg-transparent border-none text-base font-black text-white focus:outline-none focus:ring-0 placeholder-[#475569] font-sans pr-6"
                    id={`input-earning-${plat.id}`}
                  />
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 font-bold text-xs text-[#8a99ad]">
                    €
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Expenses input block */}
          <div>
            <label className="block text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase pl-0.5 mb-2">
              {language === 'ES' ? 'GASTOS DIARIOS (GASOLEO, COMIDA, ETC)' : 'DAILY EXPENSES (FUEL, MEALS, ETC)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0.00"
                value={expensesAmt}
                onChange={(e) => setExpensesAmt(e.target.value)}
                className="w-full bg-[#1e293b]/50 border border-[#2d3a4f] hover:border-[#3b4b66] focus:border-red-500 rounded-2xl py-3.5 pl-5 pr-12 text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-sans"
                id="input-daily-expenses"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#8a99ad]">
                €
              </span>
            </div>
          </div>

          {/* Notes description input block */}
          <div>
            <label className="block text-[10px] font-bold text-[#8a99ad] tracking-widest uppercase pl-0.5 mb-2">
              {t.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notesStr}
              onChange={(e) => setNotesStr(e.target.value)}
              placeholder={language === 'ES' ? 'Ej: Pinchazo de neumático, huelga nacional, etc.' : 'e.g., flat tire, heavy rain airport, etc.'}
              className="w-full bg-[#1e293b]/50 border border-[#2d3a4f] hover:border-[#3b4b66] focus:border-indigo-400 rounded-2xl py-3 px-4 text-xs font-normal text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-sans resize-none"
              id="input-daily-notes"
            />
          </div>

          {/* Form and Modal buttons */}
          <div className="pt-3">
            {!hasChanges() ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1e293b]/40 hover:bg-[#1e293b] border border-[#2d3a4f] text-[#cbd5e1] font-bold text-sm py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer"
                id="btn-cancel-daily"
              >
                {t.cancelBtn}
              </button>
            ) : (
              <div className="h-10" />
            )}
          </div>

          {hasChanges() && (
            <div className="sticky bottom-0 left-0 right-0 bg-[#111926]/95 backdrop-blur-md border-t border-[#2d3a4f]/70 -mx-6 px-6 py-4 flex items-center justify-between gap-4 z-30 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <span className="text-xs text-[#8a99ad] font-mono font-bold animate-pulse">
                {language === 'ES' ? '● Cambios sin guardar' : '● Unsaved changes'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (initialValues) {
                      setPlatformAmts(initialValues.platformAmts);
                      setExpensesAmt(initialValues.expensesAmt);
                      setNotesStr(initialValues.notesStr);
                    }
                    onClose();
                  }}
                  className="bg-[#1e293b]/80 hover:bg-[#1e293b] text-[#cbd5e1] border border-[#2d3a4f] hover:text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                  id="floating-save-btn"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {t.saveBtn}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
