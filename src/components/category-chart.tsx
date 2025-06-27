"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

// Define a type for our category data
export type CategoryExpenseData = {
  category: string;
  total: number;
  fill: string; // Color for the chart slice
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export function CategoryChart({ data }: { data: Omit<CategoryExpenseData, 'fill'>[] }) {
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data]);

  const chartConfig = React.useMemo(() => {
    if (!chartData) return {};
    return chartData.reduce((acc, item) => {
      acc[item.category] = { label: item.category, color: item.fill };
      return acc;
    }, {} as any);
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
        <div className="flex flex-col">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Your spending distribution this month.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center flex-1">
              <div className="flex items-center justify-center w-full text-center rounded-lg bg-muted/50 p-4 min-h-[200px]">
                <p className="text-sm text-muted-foreground">No expense data for this month.</p>
              </div>
            </CardContent>
        </div>
    )
  }

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Your spending distribution this month.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-96"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name) => (
                    <div className="flex items-center justify-between w-full min-w-[120px]">
                      <span>{name}</span>
                      <span className="ml-4 font-semibold">{formatCurrency(Number(value))}</span>
                    </div>
                )}
              />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              innerRadius={80}
              strokeWidth={5}
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
             <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </div>
  )
}
