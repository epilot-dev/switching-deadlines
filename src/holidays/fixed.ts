import { HolidayType, Bundesland } from './types'
import type { Holiday } from './types'

/**
 * Get all fixed-date holidays for a given year
 * @param year The year to calculate the fixed holidays for
 * @returns array of holidays
 */
export function getFixedHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = []

  // Neujahr (New Year's Day) - January 1
  holidays.push({
    date: `${year}-01-01`,
    name: 'Neujahr',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Heilige Drei Könige (Epiphany) - January 6 (only in some states)
  holidays.push({
    date: `${year}-01-06`,
    name: 'Heilige Drei Könige',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [Bundesland.BW, Bundesland.BY, Bundesland.ST]
  })

  // Internationaler Frauentag (International Women's Day) - March 8 (only in Berlin and MV)
  holidays.push({
    date: `${year}-03-08`,
    name: 'Internationaler Frauentag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [Bundesland.BE, Bundesland.MV]
  })

  // Tag der Arbeit (Labour Day) - May 1
  holidays.push({
    date: `${year}-05-01`,
    name: 'Tag der Arbeit',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Mariä Himmelfahrt (Assumption of Mary) - August 15 (only in some parts of BY and SL)
  holidays.push({
    date: `${year}-08-15`,
    name: 'Mariä Himmelfahrt',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [Bundesland.BY, Bundesland.SL]
  })

  // Weltkindertag (World Children's Day) - September 20 (only in Thuringia)
  holidays.push({
    date: `${year}-09-20`,
    name: 'Weltkindertag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [Bundesland.TH]
  })

  // Tag der Deutschen Einheit (German Unity Day) - October 3
  holidays.push({
    date: `${year}-10-03`,
    name: 'Tag der Deutschen Einheit',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Reformationstag (Reformation Day) - October 31 (in some states)
  holidays.push({
    date: `${year}-10-31`,
    name: 'Reformationstag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [
      Bundesland.BB,
      Bundesland.HB,
      Bundesland.HH,
      Bundesland.MV,
      Bundesland.NI,
      Bundesland.SN,
      Bundesland.ST,
      Bundesland.SH,
      Bundesland.TH
    ]
  })

  // Allerheiligen (All Saints' Day) - November 1 (in some states)
  holidays.push({
    date: `${year}-11-01`,
    name: 'Allerheiligen',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [
      Bundesland.BW,
      Bundesland.BY,
      Bundesland.NW,
      Bundesland.RP,
      Bundesland.SL
    ]
  })

  // Heiligabend (Christmas Eve) - December 24 (always non-working per GPKE/GeLi Gas)
  holidays.push({
    date: `${year}-12-24`,
    name: 'Heiligabend',
    type: HolidayType.OPERATIONAL_HOLIDAY,
    bundeslaender: [], // Nationwide
    description: 'Genereller Feiertag nach GPKE/GeLi Gas'
  })

  // 1. Weihnachtstag (Christmas Day) - December 25
  holidays.push({
    date: `${year}-12-25`,
    name: '1. Weihnachtstag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // 2. Weihnachtstag (Boxing Day) - December 26
  holidays.push({
    date: `${year}-12-26`,
    name: '2. Weihnachtstag',
    type: HolidayType.PUBLIC_HOLIDAY,
    bundeslaender: [] // Nationwide
  })

  // Silvester (New Year's Eve) - December 31 (always operational holiday)
  holidays.push({
    date: `${year}-12-31`,
    name: 'Silvester',
    type: HolidayType.OPERATIONAL_HOLIDAY,
    bundeslaender: [], // Nationwide
    description: 'Genereller Feiertag nach GPKE/GeLi Gas'
  })

  return holidays
}
