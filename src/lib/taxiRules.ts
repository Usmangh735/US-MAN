import { DriverPreferences } from '../types';

/**
 * Madrid Taxi Rules Configuration
 * This defines customizable rotation rules for the Madrid Taxi layout.
 */
export interface TaxiRulesConfig {
  timezone: string; // E.g., 'Europe/Madrid'
  weekendRotation: {
    // Dictates if even or odd license digits rest on even vs odd weeks
    evenDigitRestOnEvenWeek: boolean;
    oddDigitRestOnOddWeek: boolean;
  };
  madridHolidays2026: Record<string, string>;
}

// Configurable external parameters
export const MADRID_TAXI_RULES_CONFIG: TaxiRulesConfig = {
  timezone: 'Europe/Madrid',
  weekendRotation: {
    evenDigitRestOnEvenWeek: true,
    oddDigitRestOnOddWeek: true,
  },
  madridHolidays2026: {
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
  }
};

/**
 * Main Output types requested by the user
 */
export type TaxiDayStatus = 
  | 'Work Day'
  | 'Full Libranza'
  | 'Partial Libranza (Work after 20:00)';

/**
 * Calculates current status for a given target date based on driver preferences and configuration.
 * Respects strict priority rules:
 * 1. August rule (Highest priority)
 * 2. Fixed Weekday Libranza (Only non-August)
 * 3. Weekend Rotation (Only non-August)
 * 4. Default Case -> Work Day
 */
export function calculateTaxiDayStatus(
  dateStr: string, // YYYY-MM-DD format
  preferences: DriverPreferences,
  config: TaxiRulesConfig = MADRID_TAXI_RULES_CONFIG
): TaxiDayStatus {
  // Parse date safely ignoring local timezones (consider only date part)
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return 'Work Day';
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);

  // Helper date object
  const dObj = new Date(year, month, day);
  const dayOfWeek = dObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Determine license digit properties
  const licenseDigit = preferences.licenseDigit;
  const isEvenDigit = licenseDigit % 2 === 0;

  // 1. August Rule (Highest Priority – overrides everything)
  // Month 7 is August (0-indexed)
  if (month === 7) {
    if (day >= 1 && day <= 15) {
      return isEvenDigit ? 'Work Day' : 'Full Libranza';
    } else if (day === 16) {
      return 'Work Day';
    } else if (day >= 17 && day <= 31) {
      return isEvenDigit ? 'Full Libranza' : 'Work Day';
    }
  }

  // 2. Fixed Weekday Libranza (Sirf Non-August)
  // Spanish weekday abbreviations: L=Mon, M=Tue, X=Wed, J=Thu, V=Fri
  const weekdayAbbrs = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // matching getDay() index
  const currentDayAbbr = weekdayAbbrs[dayOfWeek];

  if (month !== 7 && preferences.fixedDayOff === currentDayAbbr) {
    return 'Full Libranza';
  }

  // 3. Weekend Rotation (Sirf Non-August)
  // Weekends: Saturday (6) or Sunday (0)
  if (month !== 7 && (dayOfWeek === 6 || dayOfWeek === 0)) {
    // Generate week number to determine odd/even rotation
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((dObj.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    // Determine standard week number
    const weekNum = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    const isEvenWeek = weekNum % 2 === 0;

    let isWeekendRest = false;
    if (isEvenDigit) {
      // Configuration dictates weekend resting behavior for even digits
      isWeekendRest = config.weekendRotation.evenDigitRestOnEvenWeek ? isEvenWeek : !isEvenWeek;
    } else {
      // Config dictates resting behavior for odd digits
      isWeekendRest = config.weekendRotation.oddDigitRestOnOddWeek ? !isEvenWeek : isEvenWeek;
    }

    // Additional: Rotate specific day of weekend check
    // Saturday even digit rests, Sunday odd digit rests (standard pattern)
    const isLicenseSatMatch = dayOfWeek === 6 && isEvenDigit;
    const isLicenseSunMatch = dayOfWeek === 0 && !isEvenDigit;

    if (isWeekendRest || isLicenseSatMatch || isLicenseSunMatch) {
      return 'Partial Libranza (Work after 20:00)';
    }
  }

  // 4. Default Case
  return 'Work Day';
}

/**
 * Returns color palettes and display names optimized for Madrid taxi style rules
 */
export function getStatusStyleAndLabel(
  status: TaxiDayStatus,
  language: 'ES' | 'EN',
  dateStr: string
) {
  // Check if it's a known holiday (ignored in August)
  const parts = dateStr.split('-');
  const isAugust = parts.length === 3 && parts[1] === '08';
  const holidayLabel = !isAugust ? MADRID_TAXI_RULES_CONFIG.madridHolidays2026[dateStr] : undefined;
  if (holidayLabel) {
    return {
      label: language === 'ES' ? `Festivo: ${holidayLabel}` : `Holiday: ${holidayLabel}`,
      style: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
    };
  }

  switch (status) {
    case 'Full Libranza':
      return {
        label: language === 'ES' ? 'Libranza Completa' : 'Full Libranza',
        style: 'bg-rose-500/20 text-rose-300 border border-rose-400/40 font-black'
      };
    case 'Partial Libranza (Work after 20:00)':
      return {
        label: language === 'ES' ? 'Libranza Parcial (Trabajo > 20h)' : 'Partial Libranza (Work > 20h)',
        style: 'bg-amber-500/20 text-amber-300 border border-amber-400/55 font-bold'
      };
    case 'Work Day':
    default:
      return {
        label: language === 'ES' ? 'Día Laborable' : 'Work Day',
        style: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
      };
  }
}
