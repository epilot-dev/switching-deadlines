import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { Commodity, UseCase } from '../index'

describe('Convenience Functions', () => {
  // Set the system time to a fixed date
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-10-01T12:00:00Z'))
  })

  // Reset the system time after tests
  afterAll(() => {
    vi.useRealTimers()
  })

  it('should work with calculateDeadline helper', async () => {
    // Import from index to test the convenience function
    const { calculateDeadline } = await import('../index')

    const result = calculateDeadline({
      commodity: Commodity.POWER,
      useCase: UseCase.SWITCH,
      requiresTermination: true
    })

    expect(result).toEqual(new Date('2025-10-07T00:00:00Z'))
  })

  it('should work with validateDate helper', async () => {
    const { validateDate } = await import('../index')

    const result = validateDate(
      {
        commodity: Commodity.POWER,
        useCase: UseCase.SWITCH,
        requiresTermination: true
      },
      '2025-10-05'
    )

    expect(result).toBe(false)
  })
})
