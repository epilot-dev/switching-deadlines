import type { DeadlineRule, Commodity, UseCase } from './types'
import { DEFAULT_DEADLINE_RULES } from './index'

/**
 * Get the applicable rule for a specific scenario
 */
export function findApplicableRule(
  commodity: Commodity,
  useCase: UseCase,
  requiresTermination: boolean,
  rules: DeadlineRule[] = DEFAULT_DEADLINE_RULES
): DeadlineRule | undefined {
  return rules.find(
    (rule) =>
      rule.commodity === commodity &&
      rule.useCase === useCase &&
      rule.requiresTermination === requiresTermination
  )
}
