import { Commodity, UseCase, type DeadlineRule } from './types'

export const GAS_RULES: DeadlineRule[] = [
  // Relocations and new registrations
  {
    id: 'gas_relocation',
    commodity: Commodity.GAS,
    useCase: UseCase.RELOCATION,
    requiresTermination: false,
    requiredWorkingDays: 0, // Can be retrospective
    allowsRetrospective: true,
    maxRetrospectiveDays: 6 * 7, // six weeks resprospective allowed
    description:
      'Retrospective switching of gas contracts for move-ins and new registrations'
  },

  // Supplier switch without termination
  {
    id: 'gas_switch_no_termination',
    commodity: Commodity.GAS,
    useCase: UseCase.SWITCH,
    requiresTermination: false,
    requiredWorkingDays: 10,
    allowsRetrospective: false,
    description:
      'Gas contract switch without termination requires 10 working days lead time'
  },

  // Supplier switch with termination
  {
    id: 'gas_switch_with_termination',
    commodity: Commodity.GAS,
    useCase: UseCase.SWITCH,
    requiresTermination: true,
    requiredWorkingDays: 13,
    allowsRetrospective: false,
    description:
      'Gas contract switch with termination requires 13 working days lead time'
  }
]
