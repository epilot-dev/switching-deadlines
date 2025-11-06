import { addDays, addMinutes, subDays } from 'date-fns'

export const normalizeDate = (date: Date | string): Date => {
  const result =
    typeof date === 'string'
      ? new Date(date)
      : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

  if (isNaN(result.valueOf())) {
    throw new Error('Invalid date value')
  }

  return result
}

export const toISODateString = (date: Date): string => {
  return normalizeDate(date).toISOString().split('T')[0]
}

export function addDaysDstSafe(date: Date, amount: number) {
  const endDate = addDays(date, amount)
  return addMinutes(
    endDate,
    date.getTimezoneOffset() - endDate.getTimezoneOffset()
  )
}

export function subDaysDstSafe(date: Date, amount: number) {
  const endDate = subDays(date, amount)
  return addMinutes(
    endDate,
    date.getTimezoneOffset() - endDate.getTimezoneOffset()
  )
}
