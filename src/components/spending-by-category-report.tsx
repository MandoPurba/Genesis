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
  total: { label: "Spent", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

type ReportProps = {
  data: { category: string; total: number }[];
  period: 'this_year' | 'last_year';
}

export function SpendingByCategoryReport({ data, period }: ReportProps) {
  
  const chartHeight = Math.max(300, data.length * 40);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Your spending breakdown for {period === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full" style={{ height: `${chartHeight}px` }}>
            <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={120}
                tick={{ fontSize: 12, textAnchor: 'end' }}
                />
                <XAxis 
                    type="number" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const num = value as number;
                        if (num >= 1_000_000) return `${formatCurrency(num / 1_000_000)}M`;
                        if (num >= 1_000) return `${formatCurrency(num / 1_000)}K`;
                        return formatCurrency(num);
                    }}
                />
                <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} nameKey="name" />}
                />
                <Bar dataKey="total" name="Spent" fill="var(--color-total)" radius={4} />
            </BarChart>
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
