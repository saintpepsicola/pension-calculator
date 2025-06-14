"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, X, PiggyBank } from "lucide-react"
import React, { useState, useCallback, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormField } from "@/components/ui/form-field"
import { AnimatedDiv } from "@/components/ui/Animated"
import { PensionFormProps, PensionFormValues } from "@/lib/types"

export const pensionFormSchema = z.object({
  desiredAnnualIncome: z.coerce.number().min(0, "Income must be positive"),
  employerMonthlyContribution: z.coerce
    .number()
    .min(0, "Contribution must be positive"),
  personalMonthlyContribution: z.coerce
    .number()
    .min(0, "Contribution must be positive"),
  retirementAge: z.coerce
    .number()
    .int()
    .min(50, "Min age is 50")
    .max(75, "Max age is 75"),
  currentPensionPots: z.array(z.coerce.number().min(0)),
})

export function PensionForm({ data, onDataChange }: PensionFormProps) {
  const [newPensionPot, setNewPensionPot] = useState("")

  const form = useForm<PensionFormValues>({
    resolver: zodResolver(pensionFormSchema),
    mode: "onChange",
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    watch,
    getValues,
    reset,
  } = form

  useEffect(() => {
    reset(data as PensionFormValues)
  }, [data, reset])

  const addPensionPot = useCallback(() => {
    const amount = Number.parseFloat(newPensionPot)
    if (amount > 0) {
      const currentPots = getValues("currentPensionPots") || []
      setValue("currentPensionPots", [...currentPots, amount], {
        shouldValidate: true,
        shouldDirty: true,
      })
      setNewPensionPot("")
    }
  }, [newPensionPot, setValue, getValues])

  const removePensionPot = useCallback(
    (index: number) => {
      const currentPots = getValues("currentPensionPots")
      setValue(
        "currentPensionPots",
        currentPots.filter((_, i) => i !== index),
        { shouldValidate: true, shouldDirty: true }
      )
    },
    [setValue, getValues]
  )

  const onSubmit = (values: PensionFormValues) => {
    onDataChange(values)
  }

  const currentPensionPotsForDisplay = watch("currentPensionPots") || []
  const totalCurrentPots = currentPensionPotsForDisplay.reduce(
    (sum, pot) => sum + pot,
    0
  )

  return (
    <Card className="w-full md:w-[380px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pension Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your details to project your pension
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            id="desiredAnnualIncome"
            label="Desired Retirement Income (yearly)"
            type="number"
            placeholder="16000"
            registration={register("desiredAnnualIncome")}
            error={errors.desiredAnnualIncome}
            prefix="£"
          />
          <FormField
            id="employerMonthlyContribution"
            label="Employer Monthly Contribution"
            type="number"
            placeholder="100"
            registration={register("employerMonthlyContribution")}
            error={errors.employerMonthlyContribution}
            prefix="£"
          />
          <FormField
            id="personalMonthlyContribution"
            label="Personal Monthly Contribution"
            type="number"
            placeholder="100"
            registration={register("personalMonthlyContribution")}
            error={errors.personalMonthlyContribution}
            prefix="£"
          />
          <FormField
            id="retirementAge"
            label="Retirement Age"
            type="number"
            placeholder="65"
            registration={register("retirementAge")}
            error={errors.retirementAge}
            min="50"
            max="75"
          />

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Current Pension Pots
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  £
                </span>
                <Input
                  type="number"
                  value={newPensionPot}
                  onChange={(e) => setNewPensionPot(e.target.value)}
                  placeholder="Enter existing pot value"
                  className="pl-8"
                  aria-label="Add pension pot"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addPensionPot()
                    }
                  }}
                />
              </div>
              <Button
                onClick={addPensionPot}
                size="sm"
                variant="outline"
                type="button"
                aria-label="Add pension pot"
              >
                + Add Pot
              </Button>
            </div>
            {errors.currentPensionPots && (
              <p className="text-destructive text-sm">
                {errors.currentPensionPots.message}
              </p>
            )}
            {currentPensionPotsForDisplay.length > 0 && (
              <AnimatedDiv
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-2">
                  {currentPensionPotsForDisplay.map((pot, index) => (
                    <AnimatedDiv
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {formatCurrency(pot)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:text-destructive"
                          onClick={() => removePensionPot(index)}
                          type="button"
                          aria-label={`Remove pot ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </AnimatedDiv>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  Total: {formatCurrency(totalCurrentPots)}
                </div>
              </AnimatedDiv>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!isValid}>
            Calculate Pension
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
