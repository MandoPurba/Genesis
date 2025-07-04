
"use client"

import * as React from "react"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { usePrivacy } from "@/contexts/privacy-context"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type ReportProps = {
  data: { month: string; [category: string]: number | string }[];
  categories: string[];
  spendingPeriod: 'this_year' | 'last_year';
  period: 'this_year' | 'last_year';
  range: '1y' | '5y' | 'all';
}

export function SpendingByCategoryReport({ data, categories, spendingPeriod, period, range }: ReportProps) {
  const { isPrivacyMode } = usePrivacy();
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    categories.forEach((category, index) => {
      config[category] = {
        label: category,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  }, [categories]);

  const hasData = categories.length > 0 && data.some(d => categories.some(cat => (d[cat] as number) > 0));

  const formatYAxisTick = (tick: number) => {
    if (isPrivacyMode) return "***";
    if (Math.abs(tick) >= 1000000) return `Rp${(tick / 1000000).toFixed(0)}M`
    if (Math.abs(tick) >= 1000) return `Rp${(tick / 1000).toFixed(0)}K`
    return formatCurrency(tick)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Spending Category Trends</CardTitle>
            <CardDescription>Monthly spending composition for {spendingPeriod === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
          </div>
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button variant={spendingPeriod === 'this_year' ? 'secondary' : 'ghost'} size="sm" asChild>
              <Link href={`/reports?spendingPeriod=this_year&period=${period}&range=${range}`} scroll={false}>This Year</Link>
            </Button>
            <Button variant={spendingPeriod === 'last_year' ? 'secondary' : 'ghost'} size="sm" asChild>
              <Link href={`/reports?spendingPeriod=last_year&period=${period}&range=${range}`} scroll={false}>Last Year</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <LineChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={formatYAxisTick} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent 
                        formatter={(value, name) => (
                           <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: chartConfig[name as string]?.color}}></div>
                                <div className="flex justify-between flex-1">
                                    <span>{name}</span>
                                    <span className="ml-4 font-bold">{formatCurrency(Number(value), isPrivacyMode)}</span>
                                </div>
                           </div>
                        )}
                        labelClassName="font-bold"
                        itemSorter={(item) => -(item.value as number)}
                    />}
                />
                <Legend />
                {categories.map((category) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    strokeWidth={2}
                    stroke={chartConfig[category]?.color}
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
