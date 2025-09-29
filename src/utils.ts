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
  return date.toISOString().split('T')[0]
}
