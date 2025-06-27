
"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
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

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type ReportProps = {
  data: { month: string; [key: string]: number | string }[];
  categories: string[];
  period: 'this_year' | 'last_year';
}

export function SpendingByCategoryReport({ data, categories, period }: ReportProps) {

  const chartConfig = React.useMemo(() => {
    return categories.reduce((acc, category, index) => {
      acc[category] = {
        label: category,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [categories]);

  const formatYAxisTick = (tick: number) => {
    if (Math.abs(tick) >= 1_000_000) return `Rp${(tick / 1_000_000).toFixed(0)}M`
    if (Math.abs(tick) >= 1_000) return `Rp${(tick / 1_000).toFixed(0)}K`
    return formatCurrency(tick)
  }

  const hasData = data.some(monthData => 
    categories.some(cat => (monthData[cat] as number) > 0)
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Spending Trends by Category</CardTitle>
        <CardDescription>Monthly spending trends for {period === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <LineChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickFormatter={formatYAxisTick}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent 
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between w-full min-w-[150px]">
                      <span>{name}</span>
                      <span className="ml-4 font-semibold">{formatCurrency(Number(value))}</span>
                    </div>
                  )}
                  itemStyle={{width: '100%'}}
                />}
              />
              <Legend />
              {categories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={`var(--color-${category})`}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-muted-foreground">No expense data for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
