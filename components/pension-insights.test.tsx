import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { PensionInsights } from "./pension-insights"
import { ChartDataPoint, PensionInsightsProps } from "@/lib/types"
import { LIFE_EXPECTANCY } from "@/lib/pension-calculations"

const simpleFormatCurrency = (value: number) => {
  const sign = value < 0 ? "-" : ""
  return `${sign}£${Math.abs(value).toLocaleString()}`
}

jest.mock("@/lib/utils", () => ({
  formatCurrency: (value: number) => simpleFormatCurrency(value),
}))

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <svg data-testid="area-chart-svg">{children}</svg>
  ),
  Area: () => <div />,
  XAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: ({ x }: { x: number }) => (
    <div data-testid={`ref-line-${x}`} />
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <svg data-testid="pie-chart-svg">{children}</svg>
  ),
  Pie: () => <div />,
  Cell: () => null,
}))

const mockChartData: ChartDataPoint[] = [
  { age: 25, projectedPot: 50000, desiredPot: 0 },
  { age: 65, projectedPot: 600000, desiredPot: 500000 },
]

describe("PensionInsights", () => {
  it("renders correctly with calculated insights data (surplus scenario)", () => {
    const mockProps: PensionInsightsProps = {
      finalProjectedPot: 600000,
      currentPotsTotal: 50000,
      yearsToRetirement: 40,
      depletionAge: undefined,
      incomeDuration: 16,
      incomeDurationSubtitle: `Your pot is projected to last past age ${LIFE_EXPECTANCY}`,
      surplusOrShortfall: 100000,
      accumulationData: mockChartData,
      depletionData: [],
      totalGrowth: 300000,
      growthAsPercentageOfPot: 50,
    }

    render(<PensionInsights {...mockProps} />)

    expect(screen.getByText("Years to Retirement")).toBeInTheDocument()
    expect(screen.getByText("40")).toBeInTheDocument()
    expect(screen.getByText("Income Duration")).toBeInTheDocument()
    expect(screen.getByText("16 Years")).toBeInTheDocument()
    expect(
      screen.getByText(
        `Your pot is projected to last past age ${LIFE_EXPECTANCY}`
      )
    ).toBeInTheDocument()

    expect(screen.getByText("Surplus")).toBeInTheDocument()
    expect(screen.getByText("£100,000")).toBeInTheDocument()
    expect(
      screen.getByText("Projected surplus over your goal")
    ).toBeInTheDocument()

    expect(screen.getByText("Projected Pot at Retirement")).toBeInTheDocument()
    expect(screen.getByText("£600,000")).toBeInTheDocument()
    expect(
      screen.getByText(
        `Your pension pot grows from £50,000 to this amount in 40 years.`
      )
    ).toBeInTheDocument()

    expect(screen.getByText("Pot Composition")).toBeInTheDocument()
    expect(screen.getByText("£300,000")).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("renders correctly with calculated insights data (shortfall scenario)", () => {
    const mockProps: PensionInsightsProps = {
      finalProjectedPot: 450000,
      currentPotsTotal: 50000,
      yearsToRetirement: 40,
      depletionAge: undefined,
      incomeDuration: 16,
      incomeDurationSubtitle: `Your pot is projected to last past age ${LIFE_EXPECTANCY}`,
      surplusOrShortfall: -50000, // Shortfall
      accumulationData: mockChartData,
      depletionData: [],
      totalGrowth: 200000,
      growthAsPercentageOfPot: 44.44,
    }

    render(<PensionInsights {...mockProps} />)

    expect(screen.getByText("Shortfall")).toBeInTheDocument()
    expect(screen.getByText("-£50,000")).toBeInTheDocument()
    expect(
      screen.getByText("Projected shortfall from your goal")
    ).toBeInTheDocument()
  })

  it("displays depletion age and income duration when pot depletes", () => {
    const mockProps: PensionInsightsProps = {
      finalProjectedPot: 300000,
      currentPotsTotal: 50000,
      yearsToRetirement: 40,
      depletionAge: 75,
      incomeDuration: 10,
      incomeDurationSubtitle: "Based on a pot depletion age of 75",
      surplusOrShortfall: -200000,
      accumulationData: mockChartData,
      depletionData: [
        { age: 66, projectedPot: 280000, value: 280000, desiredPot: 500000 },
      ],
      totalGrowth: 100000,
      growthAsPercentageOfPot: 33.33,
    }

    render(<PensionInsights {...mockProps} />)

    expect(screen.getByText("Income Duration")).toBeInTheDocument()
    expect(screen.getByText("10 Years")).toBeInTheDocument()
    expect(
      screen.getByText("Based on a pot depletion age of 75")
    ).toBeInTheDocument()

    expect(screen.getByText("Retirement Drawdown")).toBeInTheDocument()
    expect(screen.getByText("Pot Depletes at ~ Age 75")).toBeInTheDocument()
  })

  it("returns null if accumulationData is empty", () => {
    const mockProps: PensionInsightsProps = {
      finalProjectedPot: 0,
      currentPotsTotal: 0,
      yearsToRetirement: 0,
      incomeDuration: 0,
      incomeDurationSubtitle: "",
      surplusOrShortfall: 0,
      accumulationData: [], // Empty data
      depletionData: [],
      depletionAge: undefined,
      totalGrowth: 0,
      growthAsPercentageOfPot: 0,
    }

    const { container } = render(<PensionInsights {...mockProps} />)
    expect(container.firstChild).toBeNull()
  })
})
