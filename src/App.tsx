import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar as CalendarIcon, 
  Settings, 
  Coins, 
  TrendingUp, 
  Layers, 
  Sparkles, 
  Flame, 
  AlertTriangle,
  HelpCircle,
  Plus
} from 'lucide-react';
import { 
  Language, 
  TranslationSet, 
  translations, 
  Platform, 
  EarningItem, 
  Targets, 
  DriverPreferences 
} from './types';
import Header from './components/Header';
import TargetModal from './components/TargetModal';
import StatsModal from './components/StatsModal';
import PlatformSelectModal from './components/PlatformSelectModal';
import EditDailyModal from './components/EditDailyModal';
import CalendarModal from './components/CalendarModal';
import EarningsTable from './components/EarningsTable';
import StorageModal from './components/StorageModal';

// Default pre-populated dataset for May 2026 to match mockup totals exactly:
// Gross Earnings = 6.400 €
// Expenses = 820 €
// Net Profit = 5.580 €
// Working Days = 18
// Platform sums: Taxi=2840 €, Uber=2120 €, Cabify=1440 €
const INITIAL_EARNINGS: EarningItem[] = [
  // First 5 days (from Table Row in Screen 1)
  { date: '2026-05-01', earnings: { taxi: 10.10, uber: 20.20, cabify: 30.30, bolt: 0 }, expenses: 10, notes: 'Labor day holiday flight shift' },
  { date: '2026-05-02', earnings: { taxi: 15.40, uber: 22.80, cabify: 28.60, bolt: 0 }, expenses: 10, notes: 'Madrid regional holiday' },
  { date: '2026-05-03', earnings: { taxi: 45.30, uber: 38.50, cabify: 52.20, bolt: 0 }, expenses: 20, notes: 'Busy Sunday weekend rotation' },
  { date: '2026-05-04', earnings: { taxi: 20.10, uber: 25.30, cabify: 32.40, bolt: 0 }, expenses: 15, notes: 'Monday early morning shifts' },
  
  // Remaining working days to sum up to exactly: Taxi 2840, Uber 2120, Cabify 1440, Expenses 820
  // Standard working days (12 days total spread)
  { date: '2026-05-05', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56, notes: 'Routine weekday rotation' },
  { date: '2026-05-06', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-07', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-08', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-09', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-11', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-12', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-13', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-14', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-18', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-19', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  { date: '2026-05-20', earnings: { taxi: 203, uber: 148, cabify: 95, bolt: 0 }, expenses: 56 },
  
  // 1 special remaining day
  { date: '2026-05-21', earnings: { taxi: 213.10, uber: 157.20, cabify: 106.50, bolt: 0 }, expenses: 63, notes: 'Heavy rain afternoon' },

  // Today Monday May 25 (This has Today earnings of exactly 230 € as shown in Screen 1)
  { date: '2026-05-25', earnings: { taxi: 100.00, uber: 80.00, cabify: 50.00, bolt: 0 }, expenses: 30, notes: 'Buen día de faena en Madrid' },
];

const INITIAL_PLATFORMS: Platform[] = [
  { id: 'taxi', name: 'Taxi', enabled: true, color: '#10b981' },   // Emerald/Neon Mint
  { id: 'uber', name: 'Uber', enabled: true, color: '#38bdf8' },   // Sky blue
  { id: 'cabify', name: 'Cabify', enabled: true, color: '#a78bfa' }, // Purple
  { id: 'bolt', name: 'Bolt', enabled: false, color: '#34d399' },  // Disabled by default (mockup 4)
];

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [preferences, setPreferences] = useState<DriverPreferences>(() => {
    try {
      const saved = localStorage.getItem('tx_mad_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            licenseDigit: typeof parsed.licenseDigit === 'number' ? parsed.licenseDigit : 3,
            fixedDayOff: 'fixedDayOff' in parsed ? parsed.fixedDayOff : 'M',
            language: parsed.language === 'ES' ? 'ES' : 'EN',
          };
        }
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage', e);
    }
    return {
      licenseDigit: 3,
      fixedDayOff: 'M', // Martes
      language: 'EN',
    };
  });

  const [targets, setTargets] = useState<Targets>(() => {
    try {
      const saved = localStorage.getItem('tx_mad_targets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            daily: Number(parsed.daily) || 500,
            monthly: Number(parsed.monthly) || 10000,
          };
        }
      }
    } catch (e) {
      console.error('Error loading targets from localStorage', e);
    }
    return {
      daily: 500,
      monthly: 10000,
    };
  });

  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    try {
      const saved = localStorage.getItem('tx_mad_platforms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading platforms from localStorage', e);
    }
    return INITIAL_PLATFORMS;
  });

  const [earningsData, setEarningsData] = useState<EarningItem[]>(() => {
    try {
      const saved = localStorage.getItem('tx_mad_earnings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading earnings from localStorage', e);
    }
    return INITIAL_EARNINGS;
  });

  // Selected date is initiated to May 25, 2026 (Mockup Date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-25');

  // Helper to get today's actual date formatted as YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Modals visibility toggles
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [editDailyModalOpen, setEditDailyModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('tx_mad_pref', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('tx_mad_targets', JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem('tx_mad_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('tx_mad_earnings', JSON.stringify(earningsData));
  }, [earningsData]);

  // Handle resetting mock values in dropdown
  const handleResetMockData = () => {
    if (confirm('Really reset values to Madrid default demo data?')) {
      setEarningsData(INITIAL_EARNINGS);
      setPlatforms(INITIAL_PLATFORMS);
      setTargets({ daily: 500, monthly: 10000 });
      setPreferences({ licenseDigit: 3, fixedDayOff: 'M', language: 'EN' });
      setSelectedDate('2026-05-25');
      setCalendarModalOpen(false);
    }
  };

  const getLanguage = () => preferences.language;
  const t: TranslationSet = translations[getLanguage()];

  // Save edits of specific days
  const handleSaveDayEarnings = (updatedDay: EarningItem) => {
    setEarningsData((prev) => {
      // Check if the entire entry is empty/zeroed out
      const totalEarnings = Object.values(updatedDay.earnings).reduce((acc, curr) => acc + (curr || 0), 0);
      const hasExpenses = (updatedDay.expenses || 0) > 0;
      const hasNotes = !!(updatedDay.notes && updatedDay.notes.trim());
      const isEmpty = totalEarnings === 0 && !hasExpenses && !hasNotes;

      if (isEmpty) {
        // If entirely zeroed/cleared, delete the field so it is completely removed from main page
        return prev.filter((item) => item.date !== updatedDay.date);
      }

      const idx = prev.findIndex((item) => item.date === updatedDay.date);
      if (idx !== -1) {
        // Edit existing
        const list = [...prev];
        list[idx] = updatedDay;
        return list;
      } else {
        // Push newly logged
        return [...prev, updatedDay].sort((a, b) => a.date.localeCompare(b.date));
      }
    });
  };

  const handleClearDay = (dateStr: string) => {
    setEarningsData((prev) => {
      const filtered = prev.filter((item) => item.date !== dateStr);
      // Select another date if the current active selectedDate is deleted
      if (selectedDate === dateStr) {
        if (filtered.length > 0) {
          setSelectedDate(filtered[filtered.length - 1].date);
        } else {
          setSelectedDate('2026-05-25');
        }
      }
      return filtered;
    });
  };

  const handleCleanOldData = (cutoffDate: Date) => {
    setEarningsData((prev) => {
      const filtered = prev.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      });
      return filtered;
    });
  };

  // Compile calculations for today's value (May 25, 2026 or current active selection)
  const currentSelectedDayEntry = earningsData.find((item) => item.date === selectedDate) || null;
  
  let todayGrossEarnings = 0;
  if (currentSelectedDayEntry) {
    platforms.forEach((p) => {
      if (p.enabled) {
        todayGrossEarnings += currentSelectedDayEntry.earnings[p.id] || 0;
      }
    });
  }

  // Compile overall Monthly sum
  let monthlyTotalGross = 0;
  earningsData.forEach((item) => {
    platforms.forEach((p) => {
      if (p.enabled) {
        monthlyTotalGross += item.earnings[p.id] || 0;
      }
    });
  });

  // Calculate percentage ratios for the premium progress bars
  const todayProgressPercent = Math.min(100, (todayGrossEarnings / targets.daily) * 100);
  const totalProgressPercent = Math.min(100, (monthlyTotalGross / targets.monthly) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#080d19] py-0 sm:py-10 px-0 sm:px-4 leading-normal antialiased" id="us-man-app-root">
      
      {/* Visual wrapper mimicking a premium mobile viewport layout (desktop-first focus container) */}
      <div 
        className="w-full max-w-[430px] bg-[#0c1322] min-h-screen sm:min-h-[880px] sm:rounded-[42px] sm:border-8 sm:border-[#1e293b]/90 shadow-2xl flex flex-col p-5 overflow-hidden transition-all duration-300 relative"
        id="device-viewport-frame"
      >
        {/* Sleek dynamic header block and widgets */}
        <Header 
          currentLanguage={preferences.language}
          onLanguageChange={(lang) => setPreferences({ ...preferences, language: lang })}
          onResetMockData={handleResetMockData}
          onOpenTargetModal={() => setTargetModalOpen(true)}
          onOpenPlatformModal={() => setPlatformModalOpen(true)}
          onOpenStatsModal={() => setStatsModalOpen(true)}
          onOpenCalendarModal={() => setCalendarModalOpen(true)}
          onOpenStorageModal={() => setStorageModalOpen(true)}
          selectedDate={selectedDate}
        />

        {/* Target Metrics Bars - ultra-compact and exact layout/styling matching mockup */}
        <section className="bg-[#111926]/20 rounded-2xl p-4 mt-3 space-y-4" id="global-targets-board">
          
          {/* Today Tracker bar */}
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center font-sans">
              {/* Left Side: Flame icon + Label */}
              <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500/10 animate-pulse" />
                <span className="text-slate-200 text-sm font-extrabold tracking-tight uppercase">
                  {t.todayLabel}
                </span>
              </div>
              
              {/* Center: Percent complete */}
              <span className="text-xs text-slate-400/80 font-medium">
                {Math.round(todayProgressPercent)}% completed
              </span>
              
              {/* Right Side: Total current amount */}
              <span className="text-white font-black text-lg tracking-tight">
                {Math.round(todayGrossEarnings).toLocaleString('es-ES')} €
              </span>
            </div>

            {/* Premium custom styled bar */}
            <div className="relative w-full h-2 rounded-full bg-[#182335]/70 overflow-hidden">
              <div 
                className="h-full bg-[#0bd5a1] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Total cumulative tracker bar */}
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center font-sans">
              {/* Left Side: TrendingUp icon + Label */}
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-[#906dfa]" />
                <span className="text-slate-200 text-sm font-extrabold tracking-tight uppercase">
                  {t.totalLabel}
                </span>
              </div>

              {/* Center: Percent complete */}
              <span className="text-xs text-slate-400/80 font-medium">
                {Math.round(totalProgressPercent)}% completed
              </span>

              {/* Right Side: Total current amount */}
              <span className="text-white font-black text-lg tracking-tight">
                {Math.round(monthlyTotalGross).toLocaleString('es-ES')} €
              </span>
            </div>

            {/* Premium custom styled bar */}
            <div className="relative w-full h-2 rounded-full bg-[#182335]/70 overflow-hidden">
              <div 
                className="h-full bg-[#0bd5a1] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Main Viewport containing the Daily earnings checklist and summary */}
        <div className="flex-1 mt-5 flex flex-col justify-between" id="app-viewport-content">
          <div className="space-y-4 animate-fade-in">
            {/* Daily records Table component list */}
            <EarningsTable 
              earningsData={earningsData}
              platforms={platforms}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              language={preferences.language}
              onEditDay={(date) => {
                setSelectedDate(date);
                setEditDailyModalOpen(true);
              }}
              onClearDay={handleClearDay}
            />
          </div>


        </div>

        {/* Beautiful Rounded Floating Action Button (FAB) anchored at bottom-right */}
        <button
          onClick={() => {
            setSelectedDate(getTodayDateStr());
            setEditDailyModalOpen(true);
          }}
          className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] sm:right-[calc(50%-230px)] sm:bottom-8 z-40 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 rounded-full border border-emerald-300/30"
          id="fab-add-edit-record"
          title={getLanguage() === 'ES' ? 'Añadir Entrada' : 'Add Entry'}
        >
          <Plus className="w-6 h-6 stroke-[3.5px] text-slate-950" />
        </button>

        {/* Modals Deck */}
        <TargetModal 
          isOpen={targetModalOpen}
          onClose={() => setTargetModalOpen(false)}
          currentTargets={targets}
          onSave={setTargets}
          language={preferences.language}
        />

        <StatsModal 
          isOpen={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
          earningsData={earningsData}
          platforms={platforms}
          language={preferences.language}
        />

        <PlatformSelectModal 
          isOpen={platformModalOpen}
          onClose={() => setPlatformModalOpen(false)}
          availablePlatforms={platforms}
          onSave={setPlatforms}
          language={preferences.language}
        />

        <EditDailyModal 
          isOpen={editDailyModalOpen}
          onClose={() => setEditDailyModalOpen(false)}
          dateStr={selectedDate}
          onDateChange={setSelectedDate}
          activePlatforms={platforms.filter((p) => p.enabled)}
          currentEntry={currentSelectedDayEntry}
          onSave={handleSaveDayEarnings}
          onDelete={handleClearDay}
          language={preferences.language}
        />

        <CalendarModal 
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          language={preferences.language}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <StorageModal 
          isOpen={storageModalOpen}
          onClose={() => setStorageModalOpen(false)}
          earningsData={earningsData}
          onCleanOldData={handleCleanOldData}
          language={preferences.language}
        />

      </div>
    </div>
  );
}
