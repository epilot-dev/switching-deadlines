export enum HolidayType {
  WEEKEND = 'weekend',
  PUBLIC_HOLIDAY = 'public_holiday', // Regular and one-time public holidays
  OPERATIONAL_HOLIDAY = 'operational_holiday', // GPKE/GeLi Gas operational holidays (24.12, 31.12)
  SPECIAL_HOLIDAY = 'sonderfeiertag' // Other special non-working days (e.g., market transitions)
}

export enum Bundesland {
  BW = 'Baden-Württemberg',
  BY = 'Bayern',
  BE = 'Berlin',
  BB = 'Brandenburg',
  HB = 'Bremen',
  HH = 'Hamburg',
  HE = 'Hessen',
  MV = 'Mecklenburg-Vorpommern',
  NI = 'Niedersachsen',
  NW = 'Nordrhein-Westfalen',
  RP = 'Rheinland-Pfalz',
  SL = 'Saarland',
  SN = 'Sachsen',
  ST = 'Sachsen-Anhalt',
  SH = 'Schleswig-Holstein',
  TH = 'Thüringen'
}

export interface Holiday {
  date: string // ISO date string
  name: string
  type: HolidayType
  bundeslaender?: Bundesland[] // If empty, applies nationwide
  description?: string
  isOneTime?: boolean // For one-time holidays that don't repeat annually
}

export interface DayInfo {
  date: string
  isWorkingDay: boolean
  holiday?: Holiday
}

// For additional custom holidays that organizations might need
export interface CustomHolidayConfig {
  date: string
  name: string
  type?: HolidayType
  bundeslaender?: Bundesland[]
  description?: string
}
