import { UseFormRegister, FieldError } from "react-hook-form"
import * as z from "zod"
import { pensionFormSchema } from "@/components/pension-form"
import { motion } from "framer-motion"

export type MotionComponent =
  | typeof motion.div
  | typeof motion.header
  | typeof motion.p

// --- Data Structures ---

export interface ChartDataPoint {
  age: number
  projectedPot: number
  desiredPot: number
  remainingMoney?: number
  value?: number
}

export interface PensionData {
  desiredAnnualIncome?: number
  employerMonthlyContribution?: number
  personalMonthlyContribution?: number
  retirementAge?: number
  currentPensionPots: number[]
  interestRate?: number
}

export type PensionFormValues = z.infer<typeof pensionFormSchema>

// --- Component Props ---

export interface PensionFormProps {
  data: PensionData
  onDataChange: (data: PensionFormValues) => void
}

export interface FormFieldProps {
  id: string
  label: string
  type: string
  placeholder: string
  registration: ReturnType<UseFormRegister<any>>
  error?: FieldError
  prefix?: string
  min?: string
  max?: string
  pattern?: string
  maxLength?: number
}

export interface InsightCardProps {
  title: string
  value: string | React.ReactNode
  subtitle: React.ReactNode
  children: React.ReactNode
}

export interface RadialProgressCardProps {
  title: string
  subtitle: string
  value: React.ReactNode
  percentage: number
  color: string
}

export interface StatCardProps {
  title: string
  value: React.ReactNode
  subtitle?: string
}

export interface PensionInsightsProps {
  finalProjectedPot: number
  currentPotsTotal: number
  yearsToRetirement: number
  incomeDuration: number
  incomeDurationSubtitle: string
  surplusOrShortfall: number
  accumulationData: ChartDataPoint[]
  depletionData: ChartDataPoint[]
  depletionAge: number | undefined
  totalGrowth: number
  growthAsPercentageOfPot: number
}
