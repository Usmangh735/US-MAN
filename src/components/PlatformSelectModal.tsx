import React, { useState } from 'react';
import { LayoutGrid, Check, Info, Train, Car, Navigation, Zap } from 'lucide-react';
import { Language, TranslationSet, translations, Platform, PlatformId } from '../types';

interface PlatformSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlatforms: Platform[];
  onSave: (platforms: Platform[]) => void;
  language: Language;
}

export default function PlatformSelectModal({
  isOpen,
  onClose,
  availablePlatforms,
  onSave,
  language,
}: PlatformSelectModalProps) {
  const t: TranslationSet = translations[language];

  // Keep a local copy of selected platforms state
  const [localPlatforms, setLocalPlatforms] = useState<Platform[]>(() => [...availablePlatforms]);

  if (!isOpen) return null;

  const handleToggle = (id: PlatformId) => {
    setLocalPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    onSave(localPlatforms);
    onClose();
  };

  const getIcon = (id: PlatformId) => {
    switch (id) {
      case 'taxi':
        return <Car className="w-6 h-6" />;
      case 'uber':
        return <Zap className="w-6 h-6" />;
      case 'cabify':
        return <Navigation className="w-6 h-6" />;
      case 'bolt':
        return <Zap className="w-6 h-6 text-emerald-400" />;
      default:
        return <Car className="w-6 h-6" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity"
      id="platform-modal-overlay"
    >
      {/* Tap outside to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom sheet container */}
      <div 
        className="relative w-full max-w-md bg-[#111926] border-t sm:border border-[#2d3a4f] rounded-t-[28px] sm:rounded-[32px] p-6 text-white shadow-2xl z-10 animate-slide-up"
        id="platform-modal-container"
      >
        {/* Grab bar for mobile look and feel */}
        <div className="mx-auto w-12 h-1 bg-[#2d3a4f]/70 rounded-full mb-5 sm:hidden" />

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400">
            <LayoutGrid className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t.platformsTitle}
          </h2>
        </div>

        {/* Info callout container - matching exact style in screenshot 4 */}
        <div className="flex items-start gap-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl p-4 mb-5" id="platform-info-box">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200/90 leading-relaxed font-sans font-medium">
            {t.platformsSub}
          </p>
        </div>

        {/* 2x2 Platforms Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6" id="platforms-grid">
          {localPlatforms.map((plat) => {
            const isEnabled = plat.enabled;
            return (
              <button
                key={plat.id}
                onClick={() => handleToggle(plat.id)}
                className={`relative flex flex-col justify-between items-start p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  isEnabled 
                    ? 'bg-[#1e293b]/50 border-emerald-500/50 shadow-md shadow-emerald-500/5' 
                    : 'bg-[#121925]/30 border-[#2d3a4f]/60 opacity-60 hover:opacity-80'
                }`}
                id={`platform-card-${plat.id}`}
              >
                {/* Status Indicator checkmark */}
                <span className="absolute top-4 right-4">
                  {isEnabled ? (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  ) : null}
                </span>

                {/* Big Visual Icon */}
                <div 
                  className={`p-3 rounded-xl mb-4 transition-colors ${
                    isEnabled 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-[#8a99ad] bg-[#1e293b]/20'
                  }`}
                  style={isEnabled ? { color: plat.color } : {}}
                >
                  {getIcon(plat.id)}
                </div>

                {/* Metadata */}
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white font-sans">
                    {plat.name}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block ${
                    isEnabled ? 'text-emerald-400 font-black' : 'text-[#64748b]'
                  }`}>
                    {isEnabled ? (language === 'ES' ? 'ACTIVADO' : 'ENABLED') : (language === 'ES' ? 'DESACTIVADO' : 'DISABLED')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Save CTA */}
        <div className="space-y-2">
          <button
            onClick={handleSave}
            className="w-full bg-[#1e293b] hover:bg-[#202d41] border border-[#2d3a4f] text-white font-bold text-sm py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer text-center block active:scale-95"
            id="btn-save-platforms"
          >
            {t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
