import { easter } from 'date-easter'
import { addDays, previousWednesday } from 'date-fns'
import { toISODateString } from '../utils'
import { HolidayType, Bundesland } from './types'
import type { Holiday } from './types'

/**
 * Calculate the Day of Repentance (always Wednesday before November 23)
 * @param year The year to calculate the Day of Repentance for
 * @returns Date object for the Day of Repentance
 */
function calculateDayOfRepentance(year: number): Date {
  const nov23 = new Date(Date.UTC(year, 10, 23)) // month 10 = November
  // Find the previous Wednesday from November
  const dayOfRepentence = previousWednesday(nov23)
  return new Date(
    Date.UTC(
      dayOfRepentence.getFullYear(),
      dayOfRepentence.getMonth(),
      dayOfRepentence.getDate()
    )
  )
}

/**
 * Get all moving holidays (e.g. those based on Easter) for a given year
 * @param year The year to calculate the moving holidays for
 * @returns array of holidays
 */
export function getMovingHolidays(year: number): Holiday[] {
  const easterDate = easter(year)
  // Remember to subtract 1 from the month index since it's zero-based
  const easterSunday = new Date(
    Date.UTC(easterDate.year, easterDate.month - 1, easterDate.day)
  )
  const holidays: Holiday[] = []

  // Karfreitag (Good Friday) - 2 days before Easter
  holidays.push({
    date: toISODateString(addDays(easterSunday, -2)),
    name: 'Karfreitag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Ostersonntag (Easter Sunday)
  holidays.push({
    date: toISODateString(easterSunday),
    name: 'Ostersonntag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Ostermontag (Easter Monday) - 1 day after Easter
  holidays.push({
    date: toISODateString(addDays(easterSunday, 1)),
    name: 'Ostermontag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Christi Himmelfahrt (Ascension Day) - 39 days after Easter
  holidays.push({
    date: toISODateString(addDays(easterSunday, 39)),
    name: 'Christi Himmelfahrt',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Pfingstsonntag (Whit Sunday) - 49 days after Easter
  holidays.push({
    date: toISODateString(addDays(easterSunday, 49)),
    name: 'Pfingstsonntag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Pfingstmontag (Whit Monday) - 50 days after Easter
  holidays.push({
    date: toISODateString(addDays(easterSunday, 50)),
    name: 'Pfingstmontag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Fronleichnam (Corpus Christi) - 60 days after Easter (only in some states)
  holidays.push({
    date: toISODateString(addDays(easterSunday, 60)),
    name: 'Fronleichnam',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [
      Bundesland.BW,
      Bundesland.BY,
      Bundesland.HE,
      Bundesland.NW,
      Bundesland.RP,
      Bundesland.SL
    ]
  })

  // Buß- und Bettag (Day of Repentance and Prayer) - Wednesday before November 23
  const bussUndBettag = calculateDayOfRepentance(year)

  holidays.push({
    date: toISODateString(bussUndBettag),
    name: 'Buß- und Bettag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [Bundesland.SN] // Only in Saxony
  })

  return holidays
}
