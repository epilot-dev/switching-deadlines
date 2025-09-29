export enum Commodity {
  POWER = 'power',
  GAS = 'gas'
}

export enum UseCase {
  RELOCATION = 'relocation', // Einzug
  SWITCH = 'switch' // Wechsel
}

export interface DeadlineRule {
  /** Unique identifier for the rule */
  id: string

  /** The commodity this rule applies to */
  commodity: Commodity

  /** The use case this rule applies to */
  useCase: UseCase

  /** Whether this rule is for cases requiring termination */
  requiresTermination: boolean

  /** Required working days lead time */
  requiredWorkingDays: number

  /** Whether retrospective switching is allowed */
  allowsRetrospective: boolean

  /** Maximum retrospective period in days */
  maxRetrospectiveDays?: number

  /** Description of the rule */
  description: string
}
