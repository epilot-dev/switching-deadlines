import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CalendarProvider } from '../calendar-provider'
import { HolidayType } from '../holidays/types'

describe('CalendarProvider', () => {
  let calendar: CalendarProvider

  beforeEach(() => {
    // Default Sonderfeiertage are automatically included
    calendar = new CalendarProvider()
  })

  describe('Holiday Detection', () => {
    it('should identify fixed holidays', () => {
      expect(calendar.isWorkingDay('2025-01-01')).toBe(false) // Neujahr
      expect(calendar.isWorkingDay('2025-10-03')).toBe(false) // Tag der Deutschen Einheit
      expect(calendar.isWorkingDay('2025-12-24')).toBe(false) // Heiligabend
      expect(calendar.isWorkingDay('2025-12-31')).toBe(false) // Silvester
    })

    it('should identify operational holidays with correct type', () => {
      const heiligabend = calendar.getDayInfo('2025-12-24')
      expect(heiligabend.holiday?.type).toBe(HolidayType.OPERATIONAL_HOLIDAY)

      const silvester = calendar.getDayInfo('2025-12-31')
      expect(silvester.holiday?.type).toBe(HolidayType.OPERATIONAL_HOLIDAY)
    })

    it('should identify weekends', () => {
      expect(calendar.isWorkingDay('2025-10-04')).toBe(false) // Saturday
      expect(calendar.isWorkingDay('2025-10-05')).toBe(false) // Sunday
    })

    it('should identify Easter-based holidays', () => {
      // Easter 2025 is on April 20
      expect(calendar.isWorkingDay('2025-04-18')).toBe(false) // Good Friday 2025
      expect(calendar.isWorkingDay('2025-04-21')).toBe(false) // Easter Monday 2025

      // Easter 2026 is on April 05
      expect(calendar.isWorkingDay('2026-04-03')).toBe(false) // Good Friday 2026
      expect(calendar.isWorkingDay('2026-04-06')).toBe(false) // Easter Monday 2026
    })

    it('should identify the Day of Repentance and Prayer', () => {
      // Always on the Wednesday before 23. Novemeber
      expect(calendar.isWorkingDay('2025-11-19')).toBe(false)
      expect(calendar.isWorkingDay('2026-11-18')).toBe(false)

      // edge cases
      expect(calendar.isWorkingDay('2026-11-22')).toBe(false)
      expect(calendar.isWorkingDay('2033-11-16')).toBe(false)
    })

    it('should automatically include default Sonderfeiertage', () => {
      // June 6, 2025 - koordinierter Start des 24h-Lieferantenwechsels
      expect(calendar.isWorkingDay('2025-06-06')).toBe(false)
      const dayInfo = calendar.getDayInfo('2025-06-06')
      expect(dayInfo.holiday?.type).toBe(HolidayType.SPECIAL_HOLIDAY)
      expect(dayInfo.holiday?.name).toBe('Einmaliger Sonderfeiertag')
    })

    it('should include regional one-time public holidays', () => {
      // May 8, 2025 - Tag der Befreiung (only in Berlin)
      const dayInfo = calendar.getDayInfo('2025-05-08')
      expect(dayInfo.holiday?.type).toBe(HolidayType.PUBLIC_HOLIDAY)
      expect(dayInfo.holiday?.name).toBe('Tag der Befreiung')
    })

    it('should identify regular working days', () => {
      expect(calendar.isWorkingDay('2025-10-02')).toBe(true) // Thursday
      expect(calendar.isWorkingDay('2025-10-06')).toBe(true) // Monday
    })
  })

  describe('Custom Holidays', () => {
    it('should support additional custom holidays', () => {
      const customCalendar = new CalendarProvider({
        customCalendar: {
          holidays: [
            {
              date: '2025-10-01',
              name: 'Betriebsruhe',
              description: 'Company holiday'
            }
          ]
        }
      })

      expect(customCalendar.isWorkingDay('2025-10-01')).toBe(false)
      const dayInfo = customCalendar.getDayInfo('2025-10-01')
      expect(dayInfo.holiday?.name).toBe('Betriebsruhe')
    })

    it('should support updating custom holidays', () => {
      const customCalendar = new CalendarProvider()

      expect(customCalendar.isWorkingDay('2025-10-01')).toBe(true)

      customCalendar.updateCustomHolidays([
        {
          date: '2025-10-01',
          name: 'Betriebsruhe',
          description: 'Company holiday'
        }
      ])

      expect(customCalendar.isWorkingDay('2025-10-01')).toBe(false)
      const dayInfo = customCalendar.getDayInfo('2025-10-01')
      expect(dayInfo.holiday?.name).toBe('Betriebsruhe')
    })

    it('should allow disabling default Sonderfeiertage', () => {
      const noDefaultsCalendar = new CalendarProvider({
        useSpecialHolidays: false
      })

      // June 6, 2025 would be a working day without defaults
      expect(noDefaultsCalendar.isWorkingDay('2025-06-06')).toBe(true)
    })
  })

  describe('Working Day Calculations', () => {
    it('should add working days within a week', () => {
      const start = new Date('2025-10-01') // Wednesday
      const result = calendar.addWorkingDays(start, 2)
      expect(result.toISOString().split('T')[0]).toBe('2025-10-07') // Tuesday (skipping holiday and weekend)
    })

    it('should add working days across year boundary', () => {
      const start = new Date('2025-12-30') // Tuesday
      const result = calendar.addWorkingDays(start, 2)
      // Should skip 31.12 (Silvester), 01.01 (Neujahr), and weekend
      expect(result.toISOString().split('T')[0]).toBe('2026-01-06') // Monday
    })

    it('should handle Christmas period correctly', () => {
      // From Dec 23 (Tuesday) add 3 working days
      const start = new Date('2025-12-23')
      const result = calendar.addWorkingDays(start, 3)
      // Skip 24.12 (Heiligabend), 25.12 (1. Weihnachtstag), 26.12 (2. Weihnachtstag), 27.12-28.12 (weekend), 31.12 (Silvester), 01.01 (Neujahr)
      expect(result.toISOString().split('T')[0]).toBe('2026-01-03') // Tuesday
    })
  })

  describe('Range Operations', () => {
    it('should count working days in a range', () => {
      const count = calendar.countWorkingDays('2025-12-22', '2026-01-05')
      // Dec 22 (Mon), 23 (Tue), 29 (Mon), 30 (Tue), Jan 2 (Fri), 5 (Mon) = 6 days
      expect(count).toBe(6)
    })

    it('should get all non-working days in December 2025', () => {
      const nonWorkingDays = calendar.getNonWorkingDaysInRange(
        '2025-12-01',
        '2025-12-31'
      )
      const weekends = nonWorkingDays.filter(
        (d) => d.holiday?.type === HolidayType.WEEKEND
      )
      const holidays = nonWorkingDays.filter(
        (d) =>
          d.holiday?.type === HolidayType.PUBLIC_HOLIDAY ||
          d.holiday?.type === HolidayType.OPERATIONAL_HOLIDAY
      )

      expect(weekends.length).toBeGreaterThan(0)
      expect(holidays.length).toBe(4) // 24, 25, 26, 31
    })
  })

  describe('Navigation Functions', () => {
    it('should find next working day', () => {
      const friday = new Date('2025-10-03') // Holiday (Tag der Deutschen Einheit)
      const next = calendar.getNextWorkingDay(friday)
      expect(next.toISOString().split('T')[0]).toBe('2025-10-06') // Monday
    })

    it('should find previous working day', () => {
      const monday = new Date('2025-10-06')
      const prev = calendar.getPreviousWorkingDay(monday)
      expect(prev.toISOString().split('T')[0]).toBe('2025-10-02') // Thursday (before holiday and weekend)
    })
  })

  describe('Example Scenarios', () => {
    it('should calculate electricity switch without termination', () => {
      // From Wednesday, 1 October 2025, no termination (1 working day)
      const from = new Date('2025-10-01')
      const earliest = calendar.addWorkingDays(from, 1)
      expect(earliest.toISOString().split('T')[0]).toBe('2025-10-03')
    })

    it('should calculate electricity switch with termination', () => {
      // From Wednesday, 1 October 2025, with termination (2 working days)
      const from = new Date('2025-10-01')
      const earliest = calendar.addWorkingDays(from, 2)
      expect(earliest.toISOString().split('T')[0]).toBe('2025-10-07')
    })

    it('should calculate gas switch without termination', () => {
      // 10 working days
      const from = new Date('2025-10-01')
      const earliest = calendar.addWorkingDays(from, 10)
      expect(earliest.toISOString().split('T')[0]).toBe('2025-10-17')
    })

    it('should calculate gas switch with termination', () => {
      // 13 working days
      const from = new Date('2025-10-01')
      const earliest = calendar.addWorkingDays(from, 13)
      expect(earliest.toISOString().split('T')[0]).toBe('2025-10-22')
    })
  })

  describe('Performance', () => {
    it('should cache holiday calculations', () => {
      const spy = vi.spyOn(
        calendar as unknown as {
          computeHolidays: (...args: unknown[]) => unknown
        },
        'computeHolidays'
      )

      // First call should calculate
      calendar.isWorkingDay('2025-01-01')
      expect(spy).toHaveBeenCalledTimes(1)

      // Second call should use cache
      calendar.isWorkingDay('2025-12-31')
      expect(spy).toHaveBeenCalledTimes(1) // Still only 1 call

      // Different year should calculate again
      calendar.isWorkingDay('2026-01-01')
      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap years correctly', () => {
      const feb28_2024 = new Date('2024-02-28')

      const result = calendar.addWorkingDays(feb28_2024, 2)
      expect(result.toISOString().split('T')[0]).toBe('2024-03-02')
    })

    it('should handle date strings and Date objects equally', () => {
      const dateString = '2025-10-03'
      const dateObject = new Date(dateString)

      expect(calendar.isWorkingDay(dateString)).toBe(
        calendar.isWorkingDay(dateObject)
      )
      expect(calendar.getDayInfo(dateString)).toEqual(
        calendar.getDayInfo(dateObject)
      )
    })

    it('should handle invalid dates gracefully', () => {
      expect(() => calendar.isWorkingDay('invalid-date')).toThrow()
      expect(() => calendar.isWorkingDay('2025-13-01')).toThrow() // Invalid month
    })
  })
})
