import type { Commodity, UseCase } from './rules/types'

/**
 * Represents version information of the deadlines calendar.
 *
 * @interface CalendarVersion
 * @property {string} version - The semantic version identifier (e.g., "2025.1.4")
 * @property {number} year - The calendar year this version applies to
 * @property {string} lastUpdated - ISO 8601 timestamp of when this version was last modified
 */
export interface CalendarVersion {
  version: string
  year: number
  lastUpdated: string
}

/**
 * Represents a switching case configuration.
 *
 * @interface SwitchingCase
 * @property {Commodity} commodity - The commodity type (power or gas)
 * @property {UseCase} useCase - The use case (relocation or supplier switch)
 * @property {boolean} requiresTermination - Whether termination of the previous contract is required
 */
export interface SwitchingCase {
  commodity: Commodity
  useCase: UseCase
  requiresTermination: boolean
}
