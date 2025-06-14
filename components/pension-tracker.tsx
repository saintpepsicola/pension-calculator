"use client"

import { useState, useOptimistic, startTransition } from "react"
import { PensionForm } from "@/components/pension-form"
import { AnimatedDiv } from "@/components/ui/Animated"
import { PensionData, PensionInsightsProps } from "@/lib/types"
import { PensionInsights } from "@/components/pension-insights"
import { getFullPensionProjection } from "@/lib/pension-calculations"

const initialProjectionState: PensionInsightsProps = {
  finalProjectedPot: 0,
  currentPotsTotal: 0,
  yearsToRetirement: 0,
  incomeDuration: 0,
  incomeDurationSubtitle: "",
  surplusOrShortfall: 0,
  accumulationData: [],
  depletionData: [],
  depletionAge: undefined,
  totalGrowth: 0,
  growthAsPercentageOfPot: 0,
}

export default function PensionTracker() {
  const [data, setData] = useState<PensionData>({
    desiredAnnualIncome: undefined,
    employerMonthlyContribution: undefined,
    personalMonthlyContribution: undefined,
    retirementAge: undefined,
    currentPensionPots: [],
  })

  // State for ALL calculated projection results
  const [projection, setProjection] = useState(initialProjectionState)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Optimistic states for a snappy UI
  const [optimisticData, addOptimisticData] = useOptimistic(data)
  const [optimisticProjection, setOptimisticProjection] =
    useOptimistic(projection)

  const handleFormSubmit = (formData: PensionData) => {
    // Call the single source of truth for all calculations
    const newProjection = getFullPensionProjection(formData)

    startTransition(() => {
      // Update both optimistic states together
      addOptimisticData(formData)
      setOptimisticProjection(newProjection)
    })

    // Update the real state after the transition
    setData(formData)
    setProjection(newProjection)
    setHasSubmitted(true)
  }

  // Use optimistic values for rendering, which will be instantly updated
  const displayData = optimisticData
  const displayProjection = optimisticProjection

  return (
    <div className="min-h-screen flex flex-col ">
      <AnimatedDiv className="flex-1 flex flex-col ">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row gap-8 items-start flex-1">
            <div className="w-full md:w-[380px] md:flex-shrink-0">
              <PensionForm data={displayData} onDataChange={handleFormSubmit} />
            </div>

            <div className="w-full flex-1">
              {hasSubmitted ? (
                <PensionInsights {...displayProjection} />
              ) : (
                <div className="flex w-full h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                  <p>
                    Enter your details and submit to see your pension
                    projections.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedDiv>
    </div>
  )
}
