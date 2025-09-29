export * from './types'
export * from './utils'

import { GAS_RULES } from './gas'
import { POWER_RULES } from './power'
import type { DeadlineRule } from './types'

/**
 * Default deadline rules based on GPKE and GeLi Gas regulations
 */
export const DEFAULT_DEADLINE_RULES: DeadlineRule[] = [
  ...POWER_RULES,
  ...GAS_RULES
]
