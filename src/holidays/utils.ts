import type { Holiday } from './types'

export function filterHolidaysForYear(
  holidays: Holiday[],
  year: number
): Holiday[] {
  return holidays.filter((holiday) => {
    const holidayYear = parseInt(holiday.date.split('-')[0])
    return holidayYear === year
  })
}
