import { getFullPensionProjection } from "./pension-calculations"
import { PensionData } from "./types"

describe("getFullPensionProjection", () => {
  // Test Case 1: Standard scenario
  it("should correctly project a pension pot with standard contributions", () => {
    const formData: PensionData = {
      retirementAge: 65,
      desiredAnnualIncome: 16000,
      personalMonthlyContribution: 300,
      employerMonthlyContribution: 200,
      currentPensionPots: [0],
    }

    const result = getFullPensionProjection(formData)

    expect(result.yearsToRetirement).toBe(40)
    expect(result.requiredPot).toBe(178534)
    expect(result.finalProjectedPot).toBe(723102)
    expect(result.surplusOrShortfall).toBe(723102 - 178534)

    // Check that the data arrays are populated
    expect(result.accumulationData.length).toBeGreaterThan(0)
    expect(result.depletionData.length).toBeGreaterThan(0)

    // Check a specific data point
    const finalAccumulationPoint = result.accumulationData.find(
      (d) => d.age === 65
    )
    expect(finalAccumulationPoint?.projectedPot).toBe(723102)
  })

  // Test Case 2: No contributions, only an initial pot
  it("should only calculate growth on the initial pot if there are no contributions", () => {
    const formData: PensionData = {
      retirementAge: 65,
      desiredAnnualIncome: 10000,
      personalMonthlyContribution: 0,
      employerMonthlyContribution: 0,
      currentPensionPots: [100000],
    }

    const result = getFullPensionProjection(formData)

    expect(result.finalProjectedPot).toBeCloseTo(677672, 0)
    expect(result.currentPotsTotal).toBe(100000)
    // Total contributions should be zero
    const totalContributions =
      ((formData.employerMonthlyContribution ?? 0) +
        (formData.personalMonthlyContribution ?? 0)) *
      result.yearsToRetirement *
      12
    expect(totalContributions).toBe(0)
    // Growth should be the difference
    expect(result.totalGrowth).toBeCloseTo(677672 - 100000, 0)
  })

  // Test Case 3: Retiring early
  it("should handle a shorter retirement window correctly", () => {
    const formData: PensionData = {
      retirementAge: 55, // Retiring 10 years earlier
      desiredAnnualIncome: 20000,
      personalMonthlyContribution: 500,
      employerMonthlyContribution: 250,
      currentPensionPots: [50000],
    }

    const result = getFullPensionProjection(formData)

    expect(result.yearsToRetirement).toBe(30)
    expect(result.finalProjectedPot).toBeCloseTo(810876, 0)
    expect(result.requiredPot).toBe(296959)
  })

  // Test Case 4: Pot depletes before life expectancy
  it("should correctly identify the depletion age when the pot runs out early", () => {
    const formData: PensionData = {
      retirementAge: 65,
      desiredAnnualIncome: 60000, // High withdrawal
      personalMonthlyContribution: 100,
      employerMonthlyContribution: 50,
      currentPensionPots: [10000],
    }

    const result = getFullPensionProjection(formData)

    // The pot should deplete before the standard life expectancy of 81
    expect(result.depletionAge).toBeLessThan(81)
    expect(result.depletionAge).toBeGreaterThan(65)
    if (result.depletionAge !== undefined) {
      expect(result.incomeDuration).toBe(result.depletionAge - 65)
    } else {
      fail("Expected depletionAge to be defined")
    }
    expect(result.incomeDurationSubtitle).toContain(
      `pot depletion age of ${result.depletionAge}`
    )
  })

  // Test Case 5: Pot lasts beyond life expectancy
  it("should handle cases where the pot does not deplete", () => {
    const formData: PensionData = {
      retirementAge: 65,
      desiredAnnualIncome: 10000, // Low withdrawal
      personalMonthlyContribution: 500,
      employerMonthlyContribution: 500,
      currentPensionPots: [200000],
    }

    const result = getFullPensionProjection(formData)

    // Depletion age should be undefined
    expect(result.depletionAge).toBeUndefined()
    expect(result.incomeDuration).toBe(16) // LIFE_EXPECTANCY (81) - retirementAge (65)
    expect(result.incomeDurationSubtitle).toContain(
      "projected to last past age 81"
    )
  })
})
