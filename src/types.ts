export type PlatformId = 'taxi' | 'uber' | 'cabify' | 'bolt';

export interface Platform {
  id: PlatformId;
  name: string;
  enabled: boolean;
  color: string;
}

export interface EarningItem {
  date: string; // YYYY-MM-DD
  earnings: Record<PlatformId, number>;
  expenses: number;
  notes?: string;
}

export interface Targets {
  daily: number;
  monthly: number;
}

export type Language = 'EN' | 'ES';

export interface DriverPreferences {
  licenseDigit: number; // 0-9 for rotating weekend descansos
  licenseNumber?: string; // full license string to derive digit from last character
  fixedDayOff: 'L' | 'M' | 'X' | 'J' | 'V' | null; // Spanish weekday abbreviations: Lunes, Martes, Miércoles, Jueves, Viernes
  language: Language;
}

export interface TranslationSet {
  title: string;
  todayLabel: string;
  totalLabel: string;
  dateCol: string;
  totalCol: string;
  earningsTitle: string;
  expensesTitle: string;
  netProfitTitle: string;
  workingDaysTitle: string;
  dailyAvgTitle: string;
  byPlatformTitle: string;
  exportPdfBtn: string;
  closeBtn: string;
  setTargetsTitle: string;
  dailyTargetLabel: string;
  monthlyTargetLabel: string;
  saveTargetsBtn: string;
  cancelBtn: string;
  saveBtn: string;
  platformsTitle: string;
  platformsSub: string;
  fixedDayOffTitle: string;
  fixedDayOffSub: string;
  madridCalendarTitle: string;
  legendWorkDay: string;
  legendLibranza: string;
  legendRefuerzo: string;
  legendHoliday: string;
  autoRulesTitle: string;
  rule1: string;
  rule2: string;
  rule3: string;
  rule4: string;
  addEarnings: string;
  editEarnings: string;
  notesLabel: string;
  amountLabel: string;
  licenseDigitLabel: string;
  licenseDigitSub: string;
  monAbbr: string;
  tueAbbr: string;
  wedAbbr: string;
  thuAbbr: string;
  friAbbr: string;
  satAbbr: string;
  sunAbbr: string;
  weatherMadrid: string;
  noData: string;
  generatingReport: string;
  customReport: string;
  saveSuccess: string;
  todayReached: string;
}

export const translations: Record<Language, TranslationSet> = {
  EN: {
    title: 'US-MAN',
    todayLabel: 'TODAY >',
    totalLabel: 'TOTAL >>',
    dateCol: 'DATE',
    totalCol: 'TOTAL',
    earningsTitle: 'EARNINGS',
    expensesTitle: 'EXPENSES',
    netProfitTitle: 'NET PROFIT',
    workingDaysTitle: 'WORKING DAYS',
    dailyAvgTitle: 'DAILY AVG',
    byPlatformTitle: 'BY PLATFORM',
    exportPdfBtn: 'Export PDF',
    closeBtn: 'Close',
    setTargetsTitle: 'Set Targets',
    dailyTargetLabel: 'DAILY TARGET',
    monthlyTargetLabel: 'MONTHLY TARGET',
    saveTargetsBtn: 'Save Targets',
    cancelBtn: 'Cancel',
    saveBtn: 'Save',
    platformsTitle: 'Platform Selection',
    platformsSub: 'Tap a platform to enable/disable it. Only enabled ones appear on the main page.',
    fixedDayOffTitle: 'FIXED DAY OFF (WEEKDAY)',
    fixedDayOffSub: 'Select your fixed weekday break.',
    madridCalendarTitle: 'MADRID CALENDAR',
    legendWorkDay: 'Work Day',
    legendLibranza: 'Libranza (20+)',
    legendRefuerzo: 'Refuerzo',
    legendHoliday: 'Holiday',
    autoRulesTitle: 'Auto-applied rules:',
    rule1: 'Weekend libranza (Sat or Sun, not both) rotates by your license\'s last digit.',
    rule2: 'Libranza is partial — work allowed after 20:00.',
    rule3: 'August libranza follows special rotation by license digit.',
    rule4: 'Comunidad de Madrid regional holidays + Spain national holidays are auto-included.',
    addEarnings: 'Enter Daily Entries',
    editEarnings: 'Edit Earnings for',
    notesLabel: 'Notes / Incidents',
    amountLabel: 'Amount',
    licenseDigitLabel: 'License ID / Number',
    licenseDigitSub: 'Type your license. We auto-derive odd/even from the last digit.',
    monAbbr: 'L',
    tueAbbr: 'M',
    wedAbbr: 'X',
    thuAbbr: 'J',
    friAbbr: 'V',
    satAbbr: 'S',
    sunAbbr: 'D',
    weatherMadrid: 'Madrid',
    noData: 'No entries recorded yet.',
    generatingReport: 'Generate',
    customReport: 'Download report as a detailed statement.',
    saveSuccess: 'Saved successfully!',
    todayReached: 'Daily target achieved! 🚖'
  },
  ES: {
    title: 'US-MAN',
    todayLabel: 'HOY >',
    totalLabel: 'TOTAL >>',
    dateCol: 'FECHA',
    totalCol: 'TOTAL',
    earningsTitle: 'INGRESOS',
    expensesTitle: 'GASTOS',
    netProfitTitle: 'BENEFICIO NETO',
    workingDaysTitle: 'DÍAS TRABAJADOS',
    dailyAvgTitle: 'PROM. DIARIO',
    byPlatformTitle: 'POR PLATAFORMA',
    exportPdfBtn: 'Exportar PDF',
    closeBtn: 'Cerrar',
    setTargetsTitle: 'Establecer Objetivos',
    dailyTargetLabel: 'OBJETIVO DIARIO',
    monthlyTargetLabel: 'OBJETIVO MENSUAL',
    saveTargetsBtn: 'Guardar Objetivos',
    cancelBtn: 'Cancelar',
    saveBtn: 'Guardar',
    platformsTitle: 'Selección de Plataformas',
    platformsSub: 'Toca una plataforma para activarla/desactivarla. Solo las activadas aparecen en la pantalla principal.',
    fixedDayOffTitle: 'DÍA DE DESCANSO FIJO (L-V)',
    fixedDayOffSub: 'Selecciona tu libranza fija de lunes a viernes.',
    madridCalendarTitle: 'CALENDARIO MADRID',
    legendWorkDay: 'Día Laboral',
    legendLibranza: 'Libranza (20+)',
    legendRefuerzo: 'Refuerzo',
    legendHoliday: 'Festivo',
    autoRulesTitle: 'Normativa aplicada:',
    rule1: 'La libranza de fin de semana (Sáb o Dom) rota según la última cifra de tu licencia.',
    rule2: 'La libranza del fin de semana es parcial — se permite trabajar después de las 20:00.',
    rule3: 'En agosto el descanso de fin de semana sigue una rotación especial por número.',
    rule4: 'Festivos nacionales y de la Comunidad de Madrid cargados automáticamente.',
    addEarnings: 'Introducir Registro',
    editEarnings: 'Editar Ingresos para',
    notesLabel: 'Notas / Incidencias',
    amountLabel: 'Monto',
    licenseDigitLabel: 'Número de Licencia',
    licenseDigitSub: 'Escribe tu licencia. Se auto-obtiene el par/impar según el último dígito.',
    monAbbr: 'L',
    tueAbbr: 'M',
    wedAbbr: 'X',
    thuAbbr: 'J',
    friAbbr: 'V',
    satAbbr: 'S',
    sunAbbr: 'D',
    weatherMadrid: 'Madrid',
    noData: 'Sin registros guardados.',
    generatingReport: 'Generar',
    customReport: 'Descargar informe como extracto mensual.',
    saveSuccess: '¡Guardado correctamente!',
    todayReached: '¡Objetivo del día cumplido! 🚖'
  }
};
