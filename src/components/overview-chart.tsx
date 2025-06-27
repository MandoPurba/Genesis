"use client"

import Link from "next/link"
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
import { Button } from "@/components/ui/button"
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

type OverviewChartProps = {
  data: { date: string; income: number; expense: number }[];
  range: 'monthly' | 'yearly';
}

export function OverviewChart({ data, range }: OverviewChartProps) {
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

  const formatXAxisTick = (value: string) => {
    if (range === 'monthly') {
      return value.split(" ")[1] // "Jan 01" -> "01"
    }
    return value; // "Jan", "Feb", etc.
  }

  if (!data || data.length === 0 || data.every(d => d.income === 0 && d.expense === 0)) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>A visual representation of your cash flow this {range === 'monthly' ? 'month' : 'year'}.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={range === 'monthly' ? 'default' : 'ghost'} size="sm" asChild>
              <Link href="/overview?range=monthly">Monthly</Link>
            </Button>
            <Button variant={range === 'yearly' ? 'default' : 'ghost'} size="sm" asChild>
              <Link href="/overview?range=yearly">Yearly</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1">
          <div className="flex items-center justify-center w-full h-full text-center rounded-lg bg-muted/50 p-4 min-h-[200px]">
            <p className="text-muted-foreground">No transaction data for this period to display the chart.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Your income and expense trend for this {range === 'monthly' ? 'month' : 'year'}.</CardDescription>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
            <Button variant={range === 'monthly' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href="/overview">Monthly</Link>
            </Button>
            <Button variant={range === 'yearly' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href="/overview?range=yearly">Yearly</Link>
            </Button>
          </div>
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
              tickFormatter={formatXAxisTick}
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
