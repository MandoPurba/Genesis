"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  income: { label: "Income", color: "hsl(var(--success))" },
  expense: { label: "Expense", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

type ReportProps = {
  data: { month: string; income: number; expense: number }[];
  period: 'this_year' | 'last_year';
}

export function IncomeVsExpenseReport({ data, period }: ReportProps) {

  const formatYAxisTick = (tick: number) => {
    if (Math.abs(tick) >= 1000000) return `Rp${(tick / 1000000).toFixed(0)}M`
    if (Math.abs(tick) >= 1000) return `Rp${(tick / 1000).toFixed(0)}K`
    return formatCurrency(tick)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Income vs. Expense</CardTitle>
                <CardDescription>Comparison for {period === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button variant={period === 'this_year' ? 'secondary' : 'ghost'} size="sm" asChild>
                <Link href="/reports?period=this_year" scroll={false}>This Year</Link>
                </Button>
                <Button variant={period === 'last_year' ? 'secondary' : 'ghost'} size="sm" asChild>
                <Link href="/reports?period=last_year" scroll={false}>Last Year</Link>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pl-2 flex-1">
        {data.some(d => d.income > 0 || d.expense > 0) ? (
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={formatYAxisTick} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} nameKey="name" />}
                />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
            </ChartContainer>
        ) : (
            <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-muted-foreground">No data for this period.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
