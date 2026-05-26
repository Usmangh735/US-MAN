import React, { useState } from 'react';
import { HardDrive, X, Trash2, ShieldAlert, CheckCircle2, History } from 'lucide-react';
import { Language } from '../types';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  earningsData: Array<{ date: string; [key: string]: any }>;
  onCleanOldData: (cutoffDate: Date) => void;
  language: Language;
}

export default function StorageModal({
  isOpen,
  onClose,
  earningsData,
  onCleanOldData,
  language,
}: StorageModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  if (!isOpen) return null;

  // Calculate cutoff date: exactly 2 months ago (60 days)
  const getCutoffDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const cutoff = getCutoffDate();
  const cutoffStr = cutoff.toISOString().split('T')[0];

  // Filter items older than 2 months
  const oldItems = earningsData.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate < cutoff;
  });

  const totalEntries = earningsData.length;
  const oldEntriesCount = oldItems.length;

  const handleClean = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    // Perform removal of items older than 2 months
    onCleanOldData(cutoff);
    setDeletedCount(oldEntriesCount);
    setSuccessAnimation(true);
    setConfirmDelete(false);

    // Fade out success notification after 3 seconds
    setTimeout(() => {
      setSuccessAnimation(false);
    }, 3500);
  };

  const formattedCutoffDate = () => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return cutoff.toLocaleDateString(language === 'ES' ? 'es-ES' : 'en-US', options);
  };

  // UI Strings for Storage and Cleanup
  const texts = {
    title: language === 'ES' ? 'Gestión de Almacenamiento' : 'Storage Management',
    desc: language === 'ES' 
      ? 'Los datos se guardan al 100% en tu dispositivo móvil de forma local. Puedes liberar espacio eliminando registros de más de 2 meses de antigüedad.' 
      : 'All shift records are kept 100% locally on your mobile device. To keep your app light, you can clear data older than 2 months.',
    statusTitle: language === 'ES' ? 'ESTADO DEL ALMACENAMIENTO' : 'STORAGE DIAGNOSTICS',
    totalText: language === 'ES' ? 'Registros Totales' : 'Total Shifts Logged',
    oldText: language === 'ES' ? 'Registros de más de 2 meses' : 'Records Older Than 2 Months',
    cutoffText: language === 'ES' ? `Antiguos a: ${formattedCutoffDate()}` : `Older than: ${formattedCutoffDate()}`,
    noOldText: language === 'ES' ? 'Sin registros antiguos que borrar (< 2 meses)' : 'No old records found (< 2 months old)',
    dangerTitle: language === 'ES' ? '¡Atención!' : 'Warning!',
    dangerDesc: language === 'ES' 
      ? 'Esta acción eliminará de forma permanente los registros antiguos de la memoria de tu teléfono. Esto es irreversible.' 
      : 'This action will permanently delete older shift records from your local database memory. It cannot be undone.',
    btnClean: language === 'ES' ? 'Borrar registros de más de 2 meses' : 'Delete records older than 2 months',
    btnConfirm: language === 'ES' ? '¿Sí, seguro? Haz clic otra vez para confirmar' : 'Yes, sure? Tap again to confirm',
    btnCancel: language === 'ES' ? 'Cancelar' : 'Cancel',
    successMsg: language === 'ES' 
      ? `¡Limpieza completada! Se eliminaron ${deletedCount} registros antiguos.` 
      : `Cleanup completed! Deleted ${deletedCount} legacy records.`,
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      id="storage-modal-overlay"
    >
      {/* Tap outside to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Frame Container */}
      <div 
        className="relative w-full max-w-md bg-[#111926] border-t sm:border border-[#2d3a4f] rounded-t-[28px] sm:rounded-[32px] p-6 text-white shadow-2xl z-10 animate-slide-up"
        id="storage-modal-container"
      >
        {/* Mobile grab accent */}
        <div className="mx-auto w-12 h-1 bg-[#2d3a4f]/70 rounded-full mb-5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight font-sans">
              {texts.title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-400 hover:text-white transition-all cursor-pointer"
            id="btn-close-storage-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Sub-Headline */}
        <p className="text-xs text-[#8a99ad] leading-relaxed font-sans mb-5">
          {texts.desc}
        </p>

        {/* Storage Diagnostics Block */}
        <div className="bg-[#172233]/40 border border-[#2d3a4f]/50 rounded-2xl p-4 mb-5 space-y-3" id="storage-status-block">
          <span className="block text-[9px] font-bold text-[#8a99ad] tracking-widest uppercase font-mono">
            {texts.statusTitle}
          </span>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-slate-300 font-sans font-medium">{texts.totalText}</span>
            <span className="text-sm font-black text-white font-mono bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/50">
              {totalEntries}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-[#1e293b]/70 pt-2.5">
            <div className="flex flex-col">
              <span className="text-xs text-slate-300 font-sans font-medium">{texts.oldText}</span>
              <span className="text-[10px] text-amber-400/80 font-mono font-medium mt-0.5">
                {texts.cutoffText}
              </span>
            </div>
            <span className={`text-sm font-black px-2.5 py-0.5 rounded-md border font-mono ${
              oldEntriesCount > 0 
                ? 'text-amber-400 bg-amber-950/10 border-amber-500/20' 
                : 'text-slate-500 bg-slate-800/40 border-slate-700/10'
            }`}>
              {oldEntriesCount}
            </span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successAnimation && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-sans font-bold mb-5 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{texts.successMsg}</span>
          </div>
        )}

        {/* Delete Control Section */}
        {oldEntriesCount > 0 ? (
          <div className="space-y-4">
            {/* Danger Warning Banner */}
            <div className="flex items-start gap-3 bg-rose-950/15 border border-rose-900/20 rounded-2xl p-4" id="storage-warning-box">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-400 font-sans mb-1">{texts.dangerTitle}</h4>
                <p className="text-[11px] text-rose-200/80 leading-relaxed font-sans">
                  {texts.dangerDesc}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClean}
                className={`w-full flex items-center justify-center gap-2.5 font-bold text-xs py-4 px-6 rounded-2xl cursor-pointer active:scale-95 transition-all duration-300 relative overflow-hidden ${
                  confirmDelete 
                    ? 'bg-rose-600 border border-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-rose-500/10 hover:bg-rose-550 border border-rose-500/20 text-rose-400 hover:text-white'
                }`}
                id="btn-confirm-cleanup"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {confirmDelete ? texts.btnConfirm : texts.btnClean}
                </span>
              </button>

              {confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="w-full bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#2d3a4f] text-[#cbd5e1] font-bold text-xs py-3.5 px-6 rounded-2xl transition-all cursor-pointer"
                  id="btn-cancel-cleanup"
                >
                  {texts.btnCancel}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center bg-[#172233]/10 border border-dashed border-[#2d3a4f]/40 rounded-2xl">
            <History className="w-8 h-8 text-[#475569]/80 mb-2.5 stroke-[1.5]" />
            <p className="text-xs text-[#cbd5e1] font-sans font-medium px-4">
              {texts.noOldText}
            </p>
          </div>
        )}

        {/* Close Button at bottom when not confirming */}
        {!confirmDelete && (
          <button
            onClick={onClose}
            className="w-full mt-4 bg-[#1e293b]/70 hover:bg-[#1e293b] border border-[#2d3a4f] text-[#cbd5e1] font-bold text-xs py-4 px-6 rounded-2xl transition-all text-center block active:scale-95 cursor-pointer"
            id="btn-close-storage-pane"
          >
            {language === 'ES' ? 'Entendido' : 'Got it'}
          </button>
        )}

      </div>
    </div>
  );
}
