import { PensionData, ChartDataPoint } from "./types"

export const STARTING_AGE = 25
export const LIFE_EXPECTANCY = 81

function calculateCoreProjection(formData: PensionData) {
  const desiredAnnualIncome = formData.desiredAnnualIncome ?? 0
  const employerMonthlyContribution = formData.employerMonthlyContribution ?? 0
  const personalMonthlyContribution = formData.personalMonthlyContribution ?? 0
  const retirementAge = formData.retirementAge ?? 0
  const interestRate = 4.9
  const yearsToRetirement =
    retirementAge > STARTING_AGE ? retirementAge - STARTING_AGE : 0
  const yearsInRetirement =
    LIFE_EXPECTANCY > retirementAge ? LIFE_EXPECTANCY - retirementAge : 0
  const monthlyContributions =
    employerMonthlyContribution + personalMonthlyContribution
  const currentPotsTotal = formData.currentPensionPots.reduce(
    (sum, pot) => sum + pot,
    0
  )

  const r = Math.pow(1 + interestRate / 100, 1 / 12) - 1
  const n = yearsToRetirement * 12
  const m = yearsInRetirement * 12
  const withdrawal = desiredAnnualIncome / 12

  const requiredPot =
    withdrawal > 0 && m > 0 && r > 0
      ? (withdrawal * (1 - Math.pow(1 + r, -m))) / r
      : 0

  const projectionData: ChartDataPoint[] = []
  let targetMonth: number | null = null
  let pot = currentPotsTotal

  for (let month = 1; month <= n; month++) {
    pot = pot * (1 + r) + monthlyContributions
    const age = STARTING_AGE + Math.floor((month - 1) / 12)
    if (!targetMonth && pot >= requiredPot) {
      targetMonth = month
    }
    if (month % 12 === 0 && month < n) {
      projectionData.push({
        age,
        projectedPot: Math.round(pot),
        desiredPot: requiredPot,
      })
    }
  }

  let finalProjectedPot = pot

  let remainingMoney = pot
  for (let month = 0; month <= m; month++) {
    if (month > 0) {
      remainingMoney = remainingMoney * (1 + r) - withdrawal
    }
    const age = retirementAge + Math.floor(month / 12)

    if (month === 0 || month % 12 === 0 || month === m) {
      if (
        projectionData.length === 0 ||
        projectionData[projectionData.length - 1].age !== age
      ) {
        projectionData.push({
          age,
          projectedPot: Math.max(
            0,
            Math.round(month === 0 ? pot : remainingMoney)
          ),
          desiredPot: requiredPot,
          remainingMoney: Math.round(month === 0 ? pot : remainingMoney),
        })
      }
    }
  }

  return {
    projectionData,
    targetMetAge: targetMonth
      ? STARTING_AGE + Math.floor((targetMonth - 1) / 12)
      : null,
    requiredPot: Math.round(requiredPot),
    finalProjectedPot: Math.round(finalProjectedPot),
  }
}

export const getFullPensionProjection = (formData: PensionData) => {
  const { projectionData, targetMetAge, requiredPot, finalProjectedPot } =
    calculateCoreProjection(formData)

  const retirementAge = formData.retirementAge ?? 0
  const currentPotsTotal = formData.currentPensionPots.reduce(
    (sum, pot) => sum + pot,
    0
  )
  const yearsToRetirement =
    retirementAge > STARTING_AGE ? retirementAge - STARTING_AGE : 0
  const depletionAge = projectionData.find(
    (d) => d.age > retirementAge && (d.remainingMoney ?? 0) <= 0
  )?.age
  const incomeDuration = depletionAge
    ? depletionAge - retirementAge
    : LIFE_EXPECTANCY - retirementAge
  const incomeDurationSubtitle = depletionAge
    ? `Based on a pot depletion age of ${depletionAge}`
    : `Your pot is projected to last past age ${LIFE_EXPECTANCY}`
  const surplusOrShortfall = finalProjectedPot - requiredPot
  const accumulationData = projectionData.filter((d) => d.age <= retirementAge)
  const depletionData = projectionData
    .filter((d) => d.age >= retirementAge)
    .map((d) => ({
      ...d,
      value:
        d.age === retirementAge
          ? d.projectedPot
          : Math.max(0, d.remainingMoney ?? 0),
    }))
  const totalContributions =
    ((formData.employerMonthlyContribution ?? 0) +
      (formData.personalMonthlyContribution ?? 0)) *
    yearsToRetirement *
    12
  const totalGrowth = finalProjectedPot - currentPotsTotal - totalContributions
  const growthAsPercentageOfPot =
    finalProjectedPot > 0 ? (totalGrowth / finalProjectedPot) * 100 : 0

  return {
    targetMetAge,
    requiredPot,
    finalProjectedPot,
    currentPotsTotal,
    yearsToRetirement,
    depletionAge,
    incomeDuration,
    incomeDurationSubtitle,
    surplusOrShortfall,
    accumulationData,
    depletionData,
    totalGrowth,
    growthAsPercentageOfPot,
  }
}
