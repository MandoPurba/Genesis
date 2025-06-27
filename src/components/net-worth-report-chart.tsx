
"use client"

import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip as ChartTooltipWrapper,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  netWorth: { label: "Net Worth" },
  up: { label: "Increase", color: "hsl(var(--success))" },
  down: { label: "Decrease", color: "hsl(var(--destructive))" },
  stable: { label: "Stable", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

type NetWorthReportChartProps = {
  data: { date: string; netWorth: number; up?: number | null, down?: number | null, stable?: number | null }[];
  range: '1y' | '5y' | 'all';
  period: 'this_year' | 'last_year';
  spendingPeriod: 'this_year' | 'last_year';
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Main data object for the point
      return (
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">
            {new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex w-full flex-wrap items-stretch gap-2">
            <div className="flex flex-1 justify-between leading-none">
              <span>Net Worth</span>
              <span className="font-mono font-medium tabular-nums text-foreground ml-4">
                {formatCurrency(data.netWorth)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
};


export function NetWorthReportChart({ data, range, period, spendingPeriod }: NetWorthReportChartProps) {

  const formatYAxisTick = (tick: number) => {
    if (Math.abs(tick) >= 1000000) {
      return `Rp${(tick / 1000000).toFixed(1)}M`
    }
    if (Math.abs(tick) >= 1000) {
      return `Rp${(tick / 1000).toFixed(0)}K`
    }
    return formatCurrency(tick)
  }

  const formatXAxisTick = (value: string) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
  }

  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Net Worth Trend</CardTitle>
            <CardDescription>Your financial growth over time.</CardDescription>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
            <Button variant={range === '1y' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href={`/reports?range=1y&period=${period}&spendingPeriod=${spendingPeriod}`} scroll={false}>Last Year</Link>
            </Button>
            <Button variant={range === '5y' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href={`/reports?range=5y&period=${period}&spendingPeriod=${spendingPeriod}`} scroll={false}>5 Years</Link>
            </Button>
            <Button variant={range === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href={`/reports?range=all&period=${period}&spendingPeriod=${spendingPeriod}`} scroll={false}>All Time</Link>
            </Button>
          </div>
        </CardHeader>
      <CardContent className="pb-0 pl-2">
         {data.length > 1 ? (
            <ChartContainer config={chartConfig} className="w-full" style={{ height: '350px' }}>
                <AreaChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <defs>
                        <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-up)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-up)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-down)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-down)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorStable" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-stable)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-stable)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={formatXAxisTick}
                        minTickGap={60}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={formatYAxisTick}
                        domain={['dataMin', 'dataMax']}
                    />
                    <ChartTooltipWrapper
                        cursor={true}
                        content={<CustomTooltip />}
                    />
                    <Area dataKey="up" type="monotone" stroke="var(--color-up)" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" dot={false} connectNulls={false}/>
                    <Area dataKey="down" type="monotone" stroke="var(--color-down)" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" dot={false} connectNulls={false}/>
                    <Area dataKey="stable" type="monotone" stroke="var(--color-stable)" strokeWidth={2} fillOpacity={1} fill="url(#colorStable)" dot={false} connectNulls={false}/>
                </AreaChart>
            </ChartContainer>
         ) : (
            <div className="flex items-center justify-center w-full text-center rounded-lg bg-muted/50 p-4 min-h-[350px]">
                <p className="text-muted-foreground">Not enough data to display the net worth trend.</p>
            </div>
         )}
      </CardContent>
    </Card>
  )
}
