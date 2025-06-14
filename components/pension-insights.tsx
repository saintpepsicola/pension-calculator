"use client"

import React from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  InsightCardProps,
  StatCardProps,
  PensionInsightsProps,
  RadialProgressCardProps,
} from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { STARTING_AGE, LIFE_EXPECTANCY } from "@/lib/pension-calculations"

const getDecadeMarkers = (startAge: number, endAge: number): number[] => {
  const markers: number[] = []
  const firstMarker = Math.ceil(startAge / 10) * 10
  for (let age = firstMarker; age < endAge; age += 10) {
    if (age > startAge) {
      markers.push(age)
    }
  }
  return markers
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Age
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {data.remainingMoney !== undefined ? "Remaining" : "Pot Value"}
            </span>
            <span className="font-bold">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const InsightCard = ({
  title,
  value,
  subtitle,
  children,
}: InsightCardProps) => (
  <div className="flex flex-col justify-between rounded-xl border text-card-foreground shadow-sm p-6 bg-white/50 backdrop-blur-sm">
    <div>
      <h3 className="tracking-tight text-sm font-medium text-gray-500">
        {title}
      </h3>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
    <div className="h-[100px] mt-4 -mx-6 -mb-6">{children}</div>
  </div>
)

const StatCard = ({ title, value, subtitle }: StatCardProps) => (
  <div className="rounded-xl border text-card-foreground shadow-sm py-6 px-4 bg-white/50 backdrop-blur-sm">
    <h3 className="tracking-tight text-sm font-medium text-gray-500">
      {title}
    </h3>
    <div className="text-3xl font-bold mt-1">{value}</div>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
)

const RadialProgressCard = ({
  title,
  subtitle,
  value,
  percentage,
  color,
}: RadialProgressCardProps) => {
  const data = [
    { name: "Progress", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left sm:justify-start rounded-xl border text-card-foreground shadow-sm p-6 bg-white/50 backdrop-blur-sm h-full">
      <div className="w-[80px] h-[80px] relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 100 }]}
              dataKey="value"
              stroke="#e2e8f0"
              fill="#e2e8f0"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={450}
            />
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={450}
              cornerRadius={50}
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">{`${Math.round(
          percentage
        )}%`}</div>
      </div>
      <div>
        <h3 className="tracking-tight text-sm font-medium text-gray-500">
          {title}
        </h3>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

export function PensionInsights({
  finalProjectedPot,
  currentPotsTotal,
  yearsToRetirement,
  incomeDuration,
  incomeDurationSubtitle,
  surplusOrShortfall,
  accumulationData,
  depletionData,
  depletionAge,
  totalGrowth,
  growthAsPercentageOfPot,
}: PensionInsightsProps) {
  if (accumulationData.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Years to Retirement"
          value={yearsToRetirement}
          subtitle="Until your planned retirement age"
        />
        <StatCard
          title="Income Duration"
          value={`${incomeDuration} Years`}
          subtitle={incomeDurationSubtitle}
        />
        <StatCard
          title={surplusOrShortfall >= 0 ? "Surplus" : "Shortfall"}
          value={
            <span
              className={
                surplusOrShortfall >= 0 ? "text-emerald-600" : "text-rose-600"
              }
            >
              {formatCurrency(surplusOrShortfall)}
            </span>
          }
          subtitle={
            surplusOrShortfall >= 0
              ? "Projected surplus over your goal"
              : "Projected shortfall from your goal"
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <InsightCard
            title="Projected Pot at Retirement"
            value={formatCurrency(finalProjectedPot)}
            subtitle={`Your pension pot grows from ${formatCurrency(
              currentPotsTotal
            )} to this amount in ${yearsToRetirement} years.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={accumulationData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="age" hide={true} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#6366f1",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="projectedPot"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorGrowth)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>
        </div>

        <div className="md:col-span-2">
          <InsightCard
            title="Retirement Drawdown"
            value={
              depletionAge
                ? `Pot Depletes at ~ Age ${depletionAge}`
                : `Lasts > ${LIFE_EXPECTANCY}`
            }
            subtitle="Visualisation of your pot decreasing after retirement."
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={depletionData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorDepletion"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="age" hide={true} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#f43f5e",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#colorDepletion)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>
        </div>
        <div className="md:col-span-1">
          <RadialProgressCard
            title="Pot Composition"
            value={formatCurrency(totalGrowth)}
            subtitle="is from investment growth."
            percentage={growthAsPercentageOfPot}
            color="var(--color-emerald-600)"
          />
        </div>
      </div>
    </div>
  )
}
