import type { Holiday } from './types'
import { HolidayType, Bundesland } from './types'
import { filterHolidaysForYear } from './utils'

/**
 * Default Sonderfeiertage that are legally mandated or officially declared.
 * These are built into the library and don't need to be configured by consumers.
 *
 * This list should be updated when:
 * - Bundesnetzagentur announces special operational or one-time holidays
 * - Federal or state governments declare one-time public holidays
 */
export function getAllSpecialHolidays(): Holiday[] {
  return [
    // 2020 - Historical examples
    {
      date: '2020-05-08',
      name: 'Tag der Befreiung',
      type: HolidayType.PUBLIC_HOLIDAY,
      bundeslaender: [Bundesland.BE], // Only in Berlin
      description:
        '75. Jahrestag der Befreiung vom Nationalsozialismus (einmalig)',
      isOneTime: true
    },

    // 2025
    {
      date: '2025-05-08',
      name: 'Tag der Befreiung',
      type: HolidayType.PUBLIC_HOLIDAY,
      bundeslaender: [Bundesland.BE], // Only in Berlin
      description:
        '80. Jahrestag der Befreiung vom Nationalsozialismus (einmalig)',
      isOneTime: true
    },
    {
      date: '2025-06-06',
      name: 'Einmaliger Sonderfeiertag',
      type: HolidayType.SPECIAL_HOLIDAY,
      bundeslaender: [], // Nationwide for energy market
      description: 'Koordinierter Start des 24h-Lieferantenwechsels (GPKE)',
      isOneTime: true
    }

    // Add future Sonderfeiertage here as they are announced
    // Format: YYYY-MM-DD for specific dates
  ]
}

/**
 * Filter Sonderfeiertage for a specific year
 * @param year The year to get Sonderfeiertage for
 * @returns Array of holidays that apply to the given year
 */
export function getSpecialHolidays(year: number): Holiday[] {
  return filterHolidaysForYear(getAllSpecialHolidays(), year)
}
