import { Commodity, UseCase, type DeadlineRule } from './types'

export const POWER_RULES: DeadlineRule[] = [
  // Relocations and new registrations
  {
    id: 'power_relocation',
    commodity: Commodity.POWER,
    useCase: UseCase.RELOCATION,
    requiresTermination: false,
    requiredWorkingDays: 1,
    allowsRetrospective: false,
    description: 'Power contract relocation requires 1 working day lead time'
  },

  // Supplier switch without termination
  {
    id: 'power_switch_no_termination',
    commodity: Commodity.POWER,
    useCase: UseCase.SWITCH,
    requiresTermination: false,
    requiredWorkingDays: 1,
    allowsRetrospective: false,
    description:
      'Power contract switch without termination requires 1 working day lead time'
  },

  // Supplier switch with termination
  {
    id: 'power_switch_with_termination',
    commodity: Commodity.POWER,
    useCase: UseCase.SWITCH,
    requiresTermination: true,
    requiredWorkingDays: 2,
    allowsRetrospective: false,
    description:
      'Power contract switch with termination requires 2 working days lead time'
  }
]
