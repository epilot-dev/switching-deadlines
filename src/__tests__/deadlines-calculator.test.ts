import { describe, it, expect, beforeEach } from 'vitest'
import { DeadlineCalculator } from '../deadlines-calculator'
import { Commodity, UseCase } from '../rules/types'
import type { SwitchingCase } from '../types'

describe('DeadlineCalculator', () => {
  let calculator: DeadlineCalculator

  beforeEach(() => {
    calculator = new DeadlineCalculator()
  })

  describe('Power Deadlines (24h switching)', () => {
    it('should calculate power relocation (1 working day)', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.RELOCATION,
        requiresTermination: false
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Wednesday
      )

      expect(result.earliestStartDateString).toBe('2025-10-03') // Friday
      expect(result.workingDaysApplied).toBe(1)
      expect(result.isRetrospective).toBe(false)
      expect(result.ruleApplied.id).toBe('power_relocation')
    })

    it('should calculate power switch without termination (1 working day)', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Wednesday
      )

      expect(result.earliestStartDateString).toBe('2025-10-03') // Friday
      expect(result.workingDaysApplied).toBe(1)
      expect(result.isRetrospective).toBe(false)
      expect(result.ruleApplied.id).toBe('power_switch_no_termination')
    })

    it('should calculate power switch with termination (2 working days)', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: true
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Wednesday
      )

      // Should skip Oct 3 (holiday), Oct 4-5 (weekend), so earliest is Oct 7
      expect(result.earliestStartDateString).toBe('2025-10-07') // Tuesday
      expect(result.workingDaysApplied).toBe(2)
      expect(result.isRetrospective).toBe(false)
      expect(result.ruleApplied.id).toBe('power_switch_with_termination')
    })
  })

  describe('Gas Deadlines', () => {
    it('should calculate gas switch without termination (10 working days)', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.GAS,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Wednesday
      )

      expect(result.earliestStartDateString).toBe('2025-10-17') // Friday (10 working days later)
      expect(result.workingDaysApplied).toBe(10)
      expect(result.ruleApplied.id).toBe('gas_switch_no_termination')
    })

    it('should calculate gas switch with termination (13 working days)', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.GAS,
        useCase: UseCase.SWITCH,
        requiresTermination: true
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Wednesday
      )

      expect(result.earliestStartDateString).toBe('2025-10-22') // Wednesday (13 working days later)
      expect(result.workingDaysApplied).toBe(13)
      expect(result.ruleApplied.id).toBe('gas_switch_with_termination')
    })

    it('should allow retrospective switch for gas relocation within 6 weeks', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.GAS,
        useCase: UseCase.RELOCATION,
        requiresTermination: false
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01' // Current date
      )

      expect(result.isRetrospective).toBe(true)
      expect(result.earliestStartDateString).toBe('2025-08-20')
      expect(result.workingDaysApplied).toBe(0)
      expect(result.ruleApplied.allowsRetrospective).toBe(true)
    })
  })

  describe('Date Validation', () => {
    it('should validate a valid proposed date', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      const result = calculator.validateStartDate(
        switchingCase,
        '2025-10-15',
        '2025-10-01'
      )

      expect(result.isValid).toBe(true)
      expect(result.earliestValidDate).toBeUndefined()
    })

    it('should validate a valid retrospective proposed date', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.GAS,
        useCase: UseCase.RELOCATION,
        requiresTermination: false
      }

      const result = calculator.validateStartDate(
        switchingCase,
        '2025-09-15',
        '2025-10-01'
      )

      expect(result.isValid).toBe(true)
      expect(result.earliestValidDate).toBeUndefined()
    })

    it('should reject an invalid proposed date', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: true // Requires 2 working days
      }

      const result = calculator.validateStartDate(
        switchingCase,
        '2025-10-02',
        '2025-10-01'
      )

      expect(result.isValid).toBe(false)
      expect(result.earliestValidDate).toBeDefined()
    })
  })

  describe('Custom Rules', () => {
    it('should use custom rules when provided', () => {
      const customCalculator = new DeadlineCalculator({
        customRules: [
          {
            id: 'custom_power',
            commodity: Commodity.POWER,
            useCase: UseCase.SWITCH,
            requiresTermination: false,
            requiredWorkingDays: 5, // Custom: 5 days instead of 1
            allowsRetrospective: false,
            description: 'Custom power rule'
          }
        ]
      })

      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      const result = customCalculator.calculateEarliestStartDate(
        switchingCase,
        '2025-10-01'
      )

      expect(result.workingDaysApplied).toBe(5)
      expect(result.ruleApplied.id).toBe('custom_power')
    })
  })

  describe('Edge Cases', () => {
    it('should handle year boundary transitions', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: true
      }

      const result = calculator.calculateEarliestStartDate(
        switchingCase,
        '2025-12-30' // Tuesday
      )

      // Should skip Dec 31 (Silvester), Jan 1 (Neujahr), weekend
      expect(result.earliestStartDateString).toBe('2026-01-06') // Tuesday
    })

    it('should handle invalid date strings', () => {
      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      expect(() =>
        calculator.calculateEarliestStartDate(switchingCase, 'invalid-date')
      ).toThrow('Invalid date')
    })

    it('should throw error for missing rule', () => {
      const customCalculator = new DeadlineCalculator({
        customRules: [] // No rules
      })

      const switchingCase: SwitchingCase = {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: false
      }

      expect(() =>
        customCalculator.calculateEarliestStartDate(switchingCase, '2025-10-01')
      ).toThrow('No rule found')
    })
  })
})
