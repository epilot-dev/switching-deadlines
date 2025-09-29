// Convenience function for simple use cases
import { CalendarProvider } from './calendar-provider'
import { DeadlineCalculator } from './deadlines-calculator'
import type { CalendarVersion, SwitchingCase } from './types'

/**
 * Calculate the earliest start date for a contract using default settings
 *
 * @example
 * ```typescript
 * import { calculateDeadline, Commodity, UseCase } from '@epilot/switching-deadlines';
 *
 * const result = calculateDeadline({
 *   commodity: Commodity.POWER,
 *   useCase: UseCase.SWITCH,
 *   requiresTermination: true,
 *   fromDate: '2025-10-01'
 * });
 *
 * console.log(result.earliestStartDateString); // '2025-10-07'
 * ```
 */
export function calculateDeadline(
  { commodity, useCase, requiresTermination }: SwitchingCase,
  fromDate?: string | Date
): Date {
  const calculator = new DeadlineCalculator()
  const { earliestStartDate } = calculator.calculateEarliestStartDate(
    { commodity, useCase, requiresTermination },
    fromDate
  )

  return earliestStartDate
}

/**
 * Validate if a proposed start date is valid using default settings
 *
 * @example
 * ```typescript
 * import { validateDate, Commodity, UseCase } from '@epilot/switching-deadlines';
 *
 * const result = validateDate('2025-10-05', {
 *   commodity: Commodity.POWER,
 *   useCase: UseCase.SWITCH,
 *   requiresTermination: true
 * });
 *
 * console.log(result.isValid); // false
 * console.log(result.earliestValidDate); // Date object for 2025-10-07
 * ```
 */
export function validateDate(
  { commodity, useCase, requiresTermination }: SwitchingCase,
  proposedDate: Date | string,
  fromDate?: string | Date
): boolean {
  const calculator = new DeadlineCalculator()
  const { isValid } = calculator.validateStartDate(
    { commodity, useCase, requiresTermination },
    proposedDate,
    fromDate
  )

  return isValid
}

/**
 * Get the calendar version information
 *
 * @returns The calendar version details including version number and metadata
 *
 * @example
 * ```typescript
 * import { getVersion } from '@epilot/switching-deadlines';
 *
 * const version = getVersion();
 * console.log(version); // CalendarVersion object with version info
 * ```
 */
export function getVersion(): CalendarVersion {
  const calendar = new CalendarProvider()

  return calendar.getCalendarVersion()
}
