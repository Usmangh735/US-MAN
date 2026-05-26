import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, MoreVertical, Settings, ClipboardList, RotateCcw, FileText, CalendarRange, HardDrive } from 'lucide-react';
import { Language, TranslationSet, translations } from '../types';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onResetMockData: () => void;
  onOpenTargetModal: () => void;
  onOpenPlatformModal: () => void;
  onOpenStatsModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenStorageModal: () => void;
  selectedDate: string;
}

export default function Header({
  currentLanguage,
  onLanguageChange,
  onResetMockData,
  onOpenTargetModal,
  onOpenPlatformModal,
  onOpenStatsModal,
  onOpenCalendarModal,
  onOpenStorageModal,
  selectedDate,
}: HeaderProps) {
  const t: TranslationSet = translations[currentLanguage];
  const [menuOpen, setMenuOpen] = useState(false);

  // Live weather parameters
  const [temperature, setTemperature] = useState<string>('10/20');
  const [weatherCode, setWeatherCode] = useState<number>(0);

  useEffect(() => {
    let active = true;
    async function fetchMadridWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Madrid&forecast_days=1'
        );
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (active && data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const max = data.daily?.temperature_2m_max?.[0] !== undefined ? Math.round(data.daily.temperature_2m_max[0]) : null;
          const min = data.daily?.temperature_2m_min?.[0] !== undefined ? Math.round(data.daily.temperature_2m_min[0]) : null;
          
          let displayStr = `${temp}`;
          if (max !== null && min !== null) {
            displayStr = `${min}/${max}`;
          }
          setTemperature(displayStr);
          setWeatherCode(data.current_weather.weathercode ?? 0);
        }
      } catch (err) {
        console.error('Error loading Madrid weather', err);
        if (active) {
          setTemperature('10/20');
        }
      }
    }
    fetchMadridWeather();
    return () => { active = false; };
  }, []);

  const getWeatherIcon = () => {
    if (weatherCode === 0) return <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />;
    if ([1, 2, 3, 45, 48].includes(weatherCode)) return <Cloud className="w-3.5 h-3.5 text-slate-300" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return <CloudSnow className="w-3.5 h-3.5 text-sky-200" />;
    if ([95, 96, 99].includes(weatherCode)) return <CloudLightning className="w-3.5 h-3.5 text-yellow-400" />;
    return <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />;
  };

  // Format the current date or selected date beautifully
  const getFormattedDate = () => {
    // We can show something like "MON, 25 MAY" representing May 2026 or local time
    const daysEN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const daysES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    const monthsEN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const dateObj = new Date(selectedDate);
    const dayName =
      currentLanguage === 'ES'
        ? daysES[dateObj.getDay()]
        : daysEN[dateObj.getDay()];

    const monthName =
      currentLanguage === 'ES'
        ? monthsES[dateObj.getMonth()]
        : monthsEN[dateObj.getMonth()];

    const dayNum = dateObj.getDate();

    return `${dayName}, ${dayNum} ${monthName}`;
  };

  const handleLangToggle = () => {
    const sequence: Language[] = ['EN', 'ES'];
    const nextIndex = (sequence.indexOf(currentLanguage) + 1) % sequence.length;
    onLanguageChange(sequence[nextIndex]);
  };

  return (
    <header className="relative flex items-center justify-between py-5 px-1 border-b border-[#1e293b]/70" id="us-man-app-header">
      {/* App Branding & Date */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-0.5 font-sans" id="header-app-title">
          {t.title}
        </h1>
        <p className="text-xs uppercase font-mono tracking-widest text-[#8a99ad] font-semibold" id="header-app-date">
          {getFormattedDate()}
        </p>
      </div>

      {/* Widgets & Toggles Container */}
      <div className="flex items-center gap-3">
        {/* Madrid Weather Widget */}
        <div 
          className="flex flex-col items-center justify-center bg-[#1e293b]/50 border border-[#2d3a4f] rounded-2xl px-3 py-1.5 min-w-[76px] transition-all duration-300 hover:bg-[#1e293b]/80"
          id="header-weather-widget"
          title="Madrid weather"
        >
          <div className="flex items-center gap-1.5 min-h-[14px]">
            {getWeatherIcon()}
            <span className="text-[14px] font-bold text-white tracking-tight leading-none">{temperature}</span>
          </div>
          <span className="text-[9px] font-mono font-medium text-[#8a99ad] uppercase tracking-wider leading-none mt-1">
            {t.weatherMadrid}
          </span>
        </div>



        {/* Meatball menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center p-2.5 rounded-xl bg-[#1e293b]/50 border border-[#2d3a4f] text-[#cbd5e1] hover:text-white transition-all active:scale-95"
            id="header-more-actions"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Overlay click catcher */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMenuOpen(false)} 
                id="header-menu-overlay"
              />
              
              <div 
                className="absolute right-0 mt-2 w-52 bg-[#111926] border border-[#2d3a4f] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in animate-duration-150"
                id="header-menu-dropdown"
              >
                <div className="px-3 py-2 border-b border-[#1e293b] mb-1">
                  <p className="text-[10px] font-sans font-bold text-[#8a99ad] uppercase tracking-wider">
                    US-MAN Menu
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    onOpenTargetModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50 rounded-xl transition-colors text-left font-semibold"
                  id="menu-action-targets"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  {t.setTargetsTitle}
                </button>

                <button
                  onClick={() => {
                    onOpenPlatformModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50 rounded-xl transition-colors text-left font-semibold"
                  id="menu-action-platforms"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                  {t.platformsTitle}
                </button>

                {/* 3: Report - Generar Informe */}
                <button
                  onClick={() => {
                    onOpenStatsModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50 rounded-xl transition-colors text-left font-semibold"
                  id="menu-action-reports"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  {currentLanguage === 'ES' ? 'Reporte (Informe)' : 'Report (Stats Summary)'}
                </button>

                {/* 4: Descansos y Calendario */}
                <button
                  onClick={() => {
                    onOpenCalendarModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50 rounded-xl transition-colors text-left font-semibold"
                  id="menu-action-descansos"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-purple-400" />
                  {currentLanguage === 'ES' ? 'Descansos y Refuerzos' : 'Descansos & Refuerzos'}
                </button>

                {/* 5: Storage & Cleanup */}
                <button
                  onClick={() => {
                    onOpenStorageModal();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]/50 rounded-xl transition-colors text-left font-semibold"
                  id="menu-action-storage"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                  {currentLanguage === 'ES' ? 'Limpieza de Datos (2m)' : 'Storage & Cleanup (2m)'}
                </button>

                {/* Language subsection section */}
                <div className="px-3 py-1.5 border-t border-b border-[#1e293b] mt-3 mb-1 pt-2">
                  <p className="text-[10px] font-sans font-bold text-[#8a99ad] uppercase tracking-wider">
                    {currentLanguage === 'ES' ? 'IDIOMA' : 'LANGUAGE'}
                  </p>
                </div>

                <div className="flex gap-1 p-1">
                  <button
                    onClick={() => {
                      onLanguageChange('EN');
                      setMenuOpen(false);
                    }}
                    className={`flex-1 text-center py-1.5 text-[11px] font-extrabold rounded-lg transition-all ${
                      currentLanguage === 'EN'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-[#8a99ad] hover:text-white hover:bg-[#1e293b]/40'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      onLanguageChange('ES');
                      setMenuOpen(false);
                    }}
                    className={`flex-1 text-center py-1.5 text-[11px] font-extrabold rounded-lg transition-all ${
                      currentLanguage === 'ES'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-[#8a99ad] hover:text-white hover:bg-[#1e293b]/40'
                    }`}
                  >
                    Español
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
