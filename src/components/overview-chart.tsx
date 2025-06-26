"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--success))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function OverviewChart({ data }: { data: { date: string; income: number; expense: number }[] }) {
  // Y-axis tick formatter
  const formatYAxisTick = (tick: number) => {
    if (tick >= 1000000) {
      return `Rp${tick / 1000000}M`
    }
    if (tick >= 1000) {
      return `Rp${tick / 1000}K`
    }
    return `Rp${tick}`
  }

  if (!data || data.length === 0 || data.every(d => d.income === 0 && d.expense === 0)) {
    return (
      <Card className="flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>A visual representation of your cash flow this month.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1">
          <div className="flex items-center justify-center w-full h-full text-center rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No transaction data for this month to display the chart.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col lg:col-span-2">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Your income and expense trend for this month.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pl-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.split(" ")[1]} // "Jan 01" -> "01"
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatYAxisTick}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between w-full min-w-[120px]">
                      <span>{name === 'income' ? 'Income' : 'Expense'}</span>
                      <span className="ml-4 font-semibold">{formatCurrency(Number(value))}</span>
                    </div>
                  )}
                  itemStyle={{width: '100%'}}
                />
              }
            />
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={true}
              name="Income"
            />
            <Line
              dataKey="expense"
              type="monotone"
              stroke="var(--color-expense)"
              strokeWidth={2}
              dot={true}
              name="Expense"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
