
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

export type CategoryData = {
  category: string;
  total: number;
};

type ChartData = CategoryData & {
  fill: string;
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export function IncomeBreakdownChart({ incomeData }: { incomeData: CategoryData[] }) {
  const chartData = React.useMemo(() => {
    return incomeData.map((item, index) => ({
      ...item,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [incomeData]);

  const chartConfig = React.useMemo(() => {
    return chartData.reduce((acc, item) => {
      acc[item.category] = { label: item.category, color: item.fill };
      return acc;
    }, {} as any);
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Sources</CardTitle>
        <CardDescription>A breakdown of your income sources this month.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-80"
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
                    innerRadius={70}
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
        ) : (
            <div className="flex items-center justify-center w-full text-center rounded-lg bg-muted/50 p-4 min-h-[200px]">
                <p className="text-sm text-muted-foreground">No income data for this month.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}

    