import { addDays, isSunday, isWeekend } from 'date-fns'
import type { Holiday, DayInfo, CustomHolidayConfig } from './holidays'
import {
  getFixedHolidays,
  getMovingHolidays,
  getSpecialHolidays,
  HolidayType,
  filterHolidaysForYear
} from './holidays'
import type { CalendarVersion } from './types'
import { normalizeDate, toISODateString } from './utils'
import versionInfo from './version.json' with { type: 'json' }

type HolidayMap = Map<string, Holiday>

/**
 * Calendar provider that manages holidays, working days, and date calculations.
 *
 * This class provides functionality for:
 * - Holiday detection (fixed, moving, and special holidays)
 * - Working day calculations
 * - Date range analysis
 * - Custom holiday configuration
 * - German Bundesländer-specific holiday support
 *
 * @example
 * ```typescript
 * const calendar = new CalendarProvider({
 *   customCalendar: {
 *     holidays: [
 *       { date: '2024-12-24', name: 'Christmas Eve', type: HolidayType.SPECIAL_HOLIDAY }
 *     ]
 *   },
 *   useSpecialHolidays: true
 * });
 *
 * const isWorking = calendar.isWorkingDay('2024-12-25'); // false (Christmas)
 * const nextWorking = calendar.getNextWorkingDay('2024-12-25');
 * ```
 */
export class CalendarProvider {
  /** Cache for computed holidays by year to improve performance */
  private holidayCache: Map<number, HolidayMap> = new Map()

  /** User-defined custom holidays */
  private customHolidays: Holiday[] = []

  /** Version information for the calendar configuration */
  private version: CalendarVersion

  /** Whether to include library-provided special holidays */
  private useSpecialHolidays: boolean

  /**
   * Creates a new CalendarProvider instance.
   *
   * @param options - Configuration options for the calendar
   * @param options.customCalendar - Custom calendar configuration
   * @param options.customCalendar.holidays - Array of custom holidays to include
   * @param options.customCalendar.version - Version information for custom calendar
   * @param options.useSpecialHolidays - Whether to include special holidays from the library (default: true)
   *
   * @example
   * ```typescript
   * const provider = new CalendarProvider({
   *   customCalendar: {
   *     holidays: [
   *       {
   *         date: '2024-03-17',
   *         name: 'St. Patrick\'s Day',
   *         type: HolidayType.SPECIAL_HOLIDAY,
   *         description: 'Irish cultural celebration'
   *       }
   *     ],
   *     version: { version: '1.0.0', year: 2024, lastUpdated: '2024-01-01T00:00:00Z' }
   *   },
   *   useSpecialHolidays: true
   * });
   * ```
   */
  constructor(options?: {
    customCalendar?: {
      holidays?: CustomHolidayConfig[]
      version?: CalendarVersion
    }
    useSpecialHolidays?: boolean // Default true
  }) {
    this.customHolidays = (options?.customCalendar?.holidays ?? []).map(
      (ch) => ({
        date: ch.date,
        name: ch.name,
        type: ch.type ?? HolidayType.SPECIAL_HOLIDAY,
        bundeslaender: ch.bundeslaender ?? [],
        description: ch.description
      })
    )

    this.version = options?.customCalendar?.version ?? versionInfo

    // Include special holidays provided by library by default
    this.useSpecialHolidays = options?.useSpecialHolidays ?? true
  }

  /**
   * Retrieves all holidays for a specific year with caching.
   *
   * @private
   * @param year - The year to get holidays for
   * @returns A map of date strings to Holiday objects
   */
  private getHolidaysForYear(year: number): HolidayMap {
    if (this.holidayCache.has(year)) {
      return this.holidayCache.get(year) ?? (new Map() as HolidayMap)
    }

    const holidayMap = this.computeHolidays(year)
    this.holidayCache.set(year, holidayMap)

    return holidayMap
  }

  /**
   * Computes all holidays for a given year by combining fixed, moving, special, and custom holidays.
   *
   * @private
   * @param year - The year to compute holidays for
   * @returns A map of date strings (YYYY-MM-DD) to Holiday objects
   */
  private computeHolidays(year: number): HolidayMap {
    const holidays: Holiday[] = [
      ...getFixedHolidays(year),
      ...getMovingHolidays(year)
    ]

    // Add special holidays if enabled
    const specialHolidays = getSpecialHolidays(year)
    if (this.useSpecialHolidays) {
      holidays.push(...specialHolidays)
    } else {
      holidays.push(
        ...specialHolidays.filter(
          (holiday) => holiday.type !== HolidayType.SPECIAL_HOLIDAY
        )
      )
    }

    // Add custom holidays for this year
    const customHolidaysForYear = filterHolidaysForYear(
      this.customHolidays,
      year
    )
    holidays.push(...customHolidaysForYear)

    const holidayMap = holidays.reduce((map, holiday) => {
      map.set(holiday.date, holiday)
      return map
    }, new Map() as HolidayMap)

    return holidayMap
  }

  /**
   * Checks if a specific date is a holiday.
   *
   * @param date - The date to check (Date object or ISO date string YYYY-MM-DD)
   * @returns The Holiday object if the date is a holiday, false otherwise
   *
   * @example
   * ```typescript
   * const holiday = provider.isHoliday('2024-12-25');
   * if (holiday) {
   *   console.log(`${holiday.name} is a ${holiday.type}`);
   * }
   *
   * const dateHoliday = provider.isHoliday(new Date('2024-01-01'));
   * ```
   */
  public isHoliday(date: Date | string): Holiday | false {
    const normalizedDate = normalizeDate(date)
    const year = normalizedDate.getFullYear()
    const holidays = this.getHolidaysForYear(year)

    // Check if any holiday applies (considering Bundesland rules)
    const holiday = holidays.get(toISODateString(normalizedDate))

    return holiday ?? false
  }

  /**
   * Checks if a specific date is a working day (not a weekend or holiday).
   *
   * @param date - The date to check (Date object or ISO date string YYYY-MM-DD)
   * @returns True if the date is a working day, false if it's a weekend or holiday
   *
   * @example
   * ```typescript
   * const isWorking = provider.isWorkingDay('2024-07-15'); // true (Monday, no holiday)
   * const isWeekend = provider.isWorkingDay('2024-07-14'); // false (Sunday)
   * const isHoliday = provider.isWorkingDay('2024-12-25'); // false (Christmas)
   * ```
   */
  public isWorkingDay(date: Date | string): boolean {
    const normalizedDate = normalizeDate(date)

    // Weekend check
    if (isWeekend(normalizedDate)) {
      return false
    }

    // Holiday check
    if (this.isHoliday(normalizedDate)) {
      return false
    }

    return true
  }

  /**
   * Gets detailed information about a specific day including working day status and holiday information.
   *
   * @param date - The date to analyze (Date object or ISO date string YYYY-MM-DD)
   * @returns Detailed day information including date, working day status, and holiday details
   *
   * @example
   * ```typescript
   * const dayInfo = provider.getDayInfo('2024-12-25');
   * console.log(dayInfo);
   * // {
   * //   date: '2024-12-25',
   * //   isWorkingDay: false,
   * //   holiday: { date: '2024-12-25', name: 'Weihnachtstag', type: 'PUBLIC_HOLIDAY' }
   * // }
   * ```
   */
  public getDayInfo(date: Date | string): DayInfo {
    const normalizedDate = normalizeDate(date)

    let holiday: Holiday | undefined

    // Check for holiday
    const foundHoliday = this.isHoliday(normalizedDate)
    if (foundHoliday) {
      holiday = foundHoliday
    }
    // Check for weekend
    else if (isWeekend(normalizedDate)) {
      holiday = {
        date: toISODateString(normalizedDate),
        name: isSunday(normalizedDate) ? 'Sonntag' : 'Samstag',
        type: HolidayType.WEEKEND
      }
    }

    return {
      date: toISODateString(normalizedDate),
      isWorkingDay: !holiday,
      holiday
    }
  }

  /**
   * Adds a specified number of working days to a date, skipping weekends and holidays.
   *
   * @param startDate - The starting date (Date object or ISO date string YYYY-MM-DD)
   * @param workingDays - Number of working days to add (must be positive)
   * @returns A new Date object representing the result
   *
   * @example
   * ```typescript
   * // Add 5 working days to a Friday
   * const result = provider.addWorkingDays('2024-07-12', 5); // Friday + 5 working days
   * console.log(result); // Next Friday (skipping weekend)
   *
   * // Handle holidays automatically
   * const beforeHoliday = provider.addWorkingDays('2024-12-20', 3); // Skips Christmas
   * ```
   */
  public addWorkingDays(startDate: Date | string, workingDays: number): Date {
    let date = normalizeDate(startDate)
    let workingDaysAdded = 0

    while (workingDaysAdded < workingDays) {
      date = addDays(date, 1)
      if (this.isWorkingDay(date)) {
        workingDaysAdded++
      }
    }

    // return the next day
    date = addDays(date, 1)

    return date
  }

  /**
   * Gets all working days between two dates (inclusive).
   *
   * @param startDate - The start date of the range (Date object or ISO date string YYYY-MM-DD)
   * @param endDate - The end date of the range (Date object or ISO date string YYYY-MM-DD)
   * @returns Array of DayInfo objects for all working days in the range
   *
   * @example
   * ```typescript
   * const workingDays = provider.getWorkingDaysInRange('2024-07-01', '2024-07-31');
   * console.log(`${workingDays.length} working days in July 2024`);
   *
   * workingDays.forEach(day => {
   *   console.log(`${day.date} is a working day`);
   * });
   * ```
   */
  public getWorkingDaysInRange(
    startDate: Date | string,
    endDate: Date | string
  ): DayInfo[] {
    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)
    const days: DayInfo[] = []

    let current = new Date(start)
    while (current <= end) {
      const dayInfo = this.getDayInfo(current)
      if (dayInfo.isWorkingDay) {
        days.push(dayInfo)
      }
      current = addDays(current, 1)
    }

    return days
  }

  /**
   * Gets all non-working days (weekends and holidays) between two dates (inclusive).
   *
   * @param startDate - The start date of the range (Date object or ISO date string YYYY-MM-DD)
   * @param endDate - The end date of the range (Date object or ISO date string YYYY-MM-DD)
   * @returns Array of DayInfo objects for all non-working days in the range
   *
   * @example
   * ```typescript
   * const nonWorkingDays = provider.getNonWorkingDaysInRange('2024-12-01', '2024-12-31');
   * console.log(`${nonWorkingDays.length} holidays and weekends in December 2024`);
   *
   * nonWorkingDays.forEach(day => {
   *   if (day.holiday) {
   *     console.log(`${day.date}: ${day.holiday.name} (${day.holiday.type})`);
   *   }
   * });
   * ```
   */
  public getNonWorkingDaysInRange(
    startDate: Date | string,
    endDate: Date | string
  ): DayInfo[] {
    const start = normalizeDate(startDate)
    const end = normalizeDate(endDate)
    const days: DayInfo[] = []

    let current = new Date(start)
    while (current <= end) {
      const dayInfo = this.getDayInfo(current)
      if (!dayInfo.isWorkingDay) {
        days.push(dayInfo)
      }
      current = addDays(current, 1)
    }

    return days
  }

  /**
   * Counts the number of working days between two dates (inclusive).
   *
   * @param startDate - The start date of the range (Date object or ISO date string YYYY-MM-DD)
   * @param endDate - The end date of the range (Date object or ISO date string YYYY-MM-DD)
   * @returns The number of working days in the specified range
   *
   * @example
   * ```typescript
   * const workingDaysCount = provider.countWorkingDays('2024-07-01', '2024-07-31');
   * console.log(`There are ${workingDaysCount} working days in July 2024`);
   *
   * // Quick calculation for project planning
   * const projectDays = provider.countWorkingDays('2024-01-15', '2024-03-15');
   * ```
   */
  public countWorkingDays(
    startDate: Date | string,
    endDate: Date | string
  ): number {
    return this.getWorkingDaysInRange(startDate, endDate).length
  }

  /**
   * Gets the next working day from a given date.
   *
   * @param date - The reference date (Date object or ISO date string YYYY-MM-DD)
   * @returns A Date object representing the next working day
   *
   * @example
   * ```typescript
   * // If today is Friday, get next Monday (or Tuesday if Monday is a holiday)
   * const nextWorking = provider.getNextWorkingDay('2024-07-12'); // Friday
   * console.log(nextWorking); // Monday July 15, 2024 (or next working day)
   *
   * // Automatically skips holidays
   * const afterChristmas = provider.getNextWorkingDay('2024-12-25');
   * ```
   */
  public getNextWorkingDay(date: Date | string): Date {
    let nextDay = normalizeDate(date)
    nextDay = addDays(nextDay, 1)

    while (!this.isWorkingDay(nextDay)) {
      nextDay = addDays(nextDay, 1)
    }

    return nextDay
  }

  /**
   * Gets the previous working day from a given date.
   *
   * @param date - The reference date (Date object or ISO date string YYYY-MM-DD)
   * @returns A Date object representing the previous working day
   *
   * @example
   * ```typescript
   * // If today is Monday, get previous Friday (or earlier if Friday was a holiday)
   * const prevWorking = provider.getPreviousWorkingDay('2024-07-15'); // Monday
   * console.log(prevWorking); // Friday July 12, 2024 (or previous working day)
   *
   * // Automatically skips holidays
   * const beforeNewYear = provider.getPreviousWorkingDay('2024-01-02');
   * ```
   */
  public getPreviousWorkingDay(date: Date | string): Date {
    let prevDay = normalizeDate(date)
    prevDay = addDays(prevDay, -1)

    while (!this.isWorkingDay(prevDay)) {
      prevDay = addDays(prevDay, -1)
    }

    return prevDay
  }

  /**
   * Gets the current calendar version information.
   *
   * @returns The CalendarVersion object containing version, year, and last updated information
   *
   * @example
   * ```typescript
   * const version = provider.getCalendarVersion();
   * console.log(`Calendar version: ${version.version} for year ${version.year}`);
   * console.log(`Last updated: ${version.lastUpdated}`);
   * ```
   */
  public getCalendarVersion(): CalendarVersion {
    return this.version
  }

  /**
   * Updates the custom holidays configuration and clears the holiday cache.
   *
   * @param customHolidays - Array of custom holiday configurations to replace existing ones
   *
   * @example
   * ```typescript
   * provider.updateCustomHolidays([
   *   {
   *     date: '2024-04-01',
   *     name: 'Company Foundation Day',
   *     type: HolidayType.SPECIAL_HOLIDAY,
   *     description: 'Annual company celebration'
   *   },
   *   {
   *     date: '2024-07-04',
   *     name: 'Independence Day',
   *     type: HolidayType.PUBLIC_HOLIDAY,
   *     bundeslaender: ['BY'] // Bavaria only
   *   }
   * ]);
   * ```
   */
  public updateCustomHolidays(customHolidays: CustomHolidayConfig[]): void {
    this.customHolidays = customHolidays.map((ch) => ({
      date: ch.date,
      name: ch.name,
      type: ch.type ?? HolidayType.SPECIAL_HOLIDAY,
      bundeslaender: ch.bundeslaender ?? [],
      description: ch.description
    }))
    this.holidayCache.clear() // Clear cache to force recalculation
  }
}
