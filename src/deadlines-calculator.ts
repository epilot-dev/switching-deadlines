import { differenceInDays, subDays } from 'date-fns'
import { CalendarProvider } from './calendar-provider'
import {
  DEFAULT_DEADLINE_RULES,
  findApplicableRule,
  type DeadlineRule
} from './rules'
import type { SwitchingCase } from './types'
import { normalizeDate, toISODateString } from './utils'

/**
 * Options for configuring a {@link DeadlineCalculator}.
 */
export interface DeadlineCalculatorOptions {
  /**
   * Custom holiday calendar provider used for working day calculations.
   */
  calendarProvider?: CalendarProvider

  /**
   * Override default deadline rules with custom business logic.
   */
  customRules?: DeadlineRule[]
}

/**
 * Calculator for determining deadline dates and validating start dates for utility switching cases.
 *
 * Handles different switching scenarios including power and gas contracts,
 * with support for various use cases (relocation or supplier switch) and termination requirements.
 * Can calculate both forward-looking and retrospective switching deadlines based on
 * configurable business rules and working day calendars.
 *
 * @example
 * ```typescript
 * const calculator = new DeadlineCalculator()
 *
 * const result = calculator.calculateEarliestStartDate({
 *   commodity: 'power',
 *   useCase: 'relocation',
 *   requiresTermination: false
 * })
 *
 * console.log(result.earliestStartDate)
 * ```
 */
export class DeadlineCalculator {
  private calendarProvider: CalendarProvider
  private rules: DeadlineRule[]

  /**
   * Creates a new DeadlineCalculator instance.
   *
   * @param options - Optional configuration options for the calculator.
   *
   * @example
   * ```typescript
   * // Default: built-in calendar + default rules
   * const calc = new DeadlineCalculator();
   *
   * // With a custom calendar and rules
   * const calcCustom = new DeadlineCalculator({
   *   calendarProvider: new CalendarProvider(),
   *   customRules: [], // custom DeadlineRule objects
   * });
   * ```
   */
  constructor(options?: DeadlineCalculatorOptions) {
    // Use provided calendar or create a new one with default settings
    this.calendarProvider = options?.calendarProvider ?? new CalendarProvider()

    // Setup rules: custom rules override defaults
    this.rules = options?.customRules ?? DEFAULT_DEADLINE_RULES
  }

  /**
   * Calculate the earliest possible start date for a contract
   *
   * Determines the earliest valid start date for a new utility contract based on
   * the switching case type, applicable business rules, and working day calculations.
   * Handles both standard forward switching and retrospective switching scenarios.
   *
   * @param switchingCase - The switching case configuration
   * @param switchingCase.commodity - Type of utility (power/gas)
   * @param switchingCase.useCase - Customer type (relocation or supplier change)
   * @param switchingCase.requiresTermination - Whether existing contract termination is required
   * @param fromDate - The date from which to calculate the deadline (defaults to current date)
   * @returns Object containing calculated dates, applied rules, and metadata
   * @throws {Error} When no applicable rule is found for the switching case
   */
  public calculateEarliestStartDate(
    /** The switching case configuration */
    { commodity, useCase, requiresTermination }: SwitchingCase,
    /** The date from which to calculate the deadline */
    fromDate?: Date | string
  ): {
    /** The earliest possible start date for the new contract */
    earliestStartDate: Date

    /** The earliest start date as ISO string */
    earliestStartDateString: string

    /** Number of working days applied */
    workingDaysApplied: number

    /** Total calendar days between request and earliest start */
    calendarDaysTotal: number

    /** Whether this is a retrospective switch (gas only) */
    isRetrospective: boolean

    /** The rule that was applied */
    ruleApplied: DeadlineRule
  } {
    // Find applicable rule
    const rule = this.getRule({ commodity, useCase, requiresTermination })

    if (!rule) {
      throw new Error(
        `No rule found for ${commodity} ${useCase} ` +
          `${requiresTermination ? 'with' : 'without'} termination`
      )
    }

    const from = normalizeDate(fromDate ?? new Date())
    let earliestStartDate: Date
    let isRetrospective: boolean

    if (rule.allowsRetrospective) {
      // Handle switching cases with retrospective switching
      isRetrospective = true
      earliestStartDate = subDays(from, rule.maxRetrospectiveDays ?? 0)
    } else {
      // Normal forward calculation
      isRetrospective = false
      earliestStartDate = this.calendarProvider.addWorkingDays(
        from,
        rule.requiredWorkingDays
      )
    }

    return {
      earliestStartDate,
      earliestStartDateString: toISODateString(earliestStartDate),
      workingDaysApplied: isRetrospective ? 0 : rule.requiredWorkingDays,
      calendarDaysTotal: differenceInDays(earliestStartDate, from),
      isRetrospective,
      ruleApplied: rule
    }
  }

  /**
   * Validate if a proposed start date is valid
   *
   * Checks whether a proposed contract start date meets the minimum deadline
   * requirements for the given switching case. Compares the proposed date
   * against the calculated earliest valid date.
   *
   * @param switchingCase - The switching case configuration
   * @param switchingCase.commodity - Type of utility (power/gas)
   * @param switchingCase.useCase - Customer type (relocation or supplier change)
   * @param switchingCase.requiresTermination - Whether existing contract termination is required
   * @param proposedDate - The date to validate
   * @param fromDate - The date from which to calculate the deadline (defaults to current date)
   * @returns Validation result with validity status and earliest valid alternative if invalid
   */
  public validateStartDate(
    /** The switching case configuration */
    { commodity, useCase, requiresTermination }: SwitchingCase,
    /** The date to validate the deadline for */
    proposedDate: Date | string,
    /** The date from which to calculate the deadline */
    fromDate?: Date | string
  ): {
    isValid: boolean
    earliestValidDate?: Date
    ruleApplied: DeadlineRule
  } {
    const proposed = normalizeDate(proposedDate)
    const from = normalizeDate(fromDate ?? new Date())

    // Calculate what the earliest valid date would be
    const { earliestStartDate, ruleApplied } = this.calculateEarliestStartDate(
      { commodity, useCase, requiresTermination },
      from
    )
    const isValid = proposed >= earliestStartDate

    return {
      isValid,
      earliestValidDate: isValid ? undefined : earliestStartDate,
      ruleApplied
    }
  }

  /**
   * Get all configured rules
   *
   * Returns a copy of all deadline rules currently configured in the calculator.
   * Useful for debugging or displaying available switching scenarios.
   *
   * @returns Array of all configured deadline rules
   */
  public getRules(): DeadlineRule[] {
    return [...this.rules]
  }

  /**
   * Get a specific rule for a switching case
   *
   * Finds and returns the deadline rule that applies to the specified
   * switching case configuration. Returns undefined if no matching rule exists.
   *
   * @param switchingCase - The switching case to find a rule for
   * @param switchingCase.commodity - Type of utility (power/gas)
   * @param switchingCase.useCase - Customer type (relocation or supplier change)
   * @param switchingCase.requiresTermination - Whether existing contract termination is required
   * @returns The matching deadline rule or undefined if none found
   */
  public getRule({
    commodity,
    useCase,
    requiresTermination
  }: SwitchingCase): DeadlineRule | undefined {
    return findApplicableRule(
      commodity,
      useCase,
      requiresTermination,
      this.rules
    )
  }
}
