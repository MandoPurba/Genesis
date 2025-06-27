
"use client"

import { Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis } from "recharts"
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
  
  const chartHeight = Math.max(300, data.length * 45);

  const formatXAxisTick = (tick: number) => {
    if (Math.abs(tick) >= 1_000_000) return `Rp${(tick / 1_000_000).toFixed(0)}M`
    if (Math.abs(tick) >= 1_000) return `Rp${(tick / 1_000).toFixed(0)}K`
    return formatCurrency(tick)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Spending breakdown for {period === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        {data.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full" style={{ height: `${chartHeight}px` }}>
            <ScatterChart
                margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
            >
                <CartesianGrid />
                <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={120}
                    tick={{ fontSize: 12, textAnchor: 'end' }}
                    interval={0}
                />
                <XAxis 
                    type="number" 
                    dataKey="total"
                    name="Spent"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatXAxisTick}
                />
                <ZAxis type="number" dataKey="total" range={[100, 1500]} name="Total" />
                <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="min-w-[8rem] rounded-lg border bg-background p-2 text-sm shadow-sm">
                                    <p className="font-bold">{data.category}</p>
                                    <p className="text-muted-foreground">{formatCurrency(data.total)}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Scatter name="Spending" data={data} fill="var(--color-total)" />
            </ScatterChart>
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
