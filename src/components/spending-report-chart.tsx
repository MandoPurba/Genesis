"use client"

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
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  total: {
    label: "Spent",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type SpendingReportChartProps = {
  data: { category: string; total: number }[];
}

export function SpendingReportChart({ data }: SpendingReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Bar chart showing your spending breakdown for the month.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1 min-h-[300px]">
          <div className="flex items-center justify-center w-full text-center rounded-lg bg-muted/50 p-4">
            <p className="text-muted-foreground">No expense data to display.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const chartHeight = Math.max(300, data.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A breakdown of your expenses for the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="w-full" style={{ height: `${chartHeight}px` }}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 10,
              right: 30,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={120}
              tick={{
                fontSize: 12,
                textAnchor: 'end',
              }}
              />
            <XAxis 
                type="number" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                    const num = value as number;
                    if (num >= 1000000) return `${formatCurrency(num / 1000000)}M`;
                    if (num >= 1000) return `${formatCurrency(num / 1000)}K`;
                    return formatCurrency(num);
                }}
            />
            <ChartTooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => <div className="font-semibold">{label}</div>}
                />
              }
            />
            <Bar dataKey="total" name="Spent" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
