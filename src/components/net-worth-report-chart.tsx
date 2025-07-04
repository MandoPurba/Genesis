
"use client"

import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
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
import * as React from "react"
import { usePrivacy } from "@/contexts/privacy-context"

const chartConfig = {
  netWorth: {
    label: "Net Worth",
  },
  positive: {
    color: "hsl(var(--success))",
  },
  negative: {
    color: "hsl(var(--destructive))",
  },
  neutral: {
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

type NetWorthReportChartProps = {
  data: { date: string; netWorth: number }[];
  range: '1y' | '5y' | 'all';
  period: 'this_year' | 'last_year';
  spendingPeriod: 'this_year' | 'last_year';
  trend: 'up' | 'down' | 'same';
}

export function NetWorthReportChart({ data, range, period, spendingPeriod, trend }: NetWorthReportChartProps) {
    const { isPrivacyMode } = usePrivacy();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
            <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
              <div className="font-medium">
                {new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
              <div className="flex w-full flex-wrap items-stretch gap-2">
                <div className="flex flex-1 justify-between leading-none">
                  <span>Net Worth</span>
                  <span className={`font-mono font-medium tabular-nums ml-4 ${data.netWorth >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {formatCurrency(data.netWorth, isPrivacyMode)}
                  </span>
                </div>
              </div>
            </div>
          );
        }
        return null;
    };


  const formatYAxisTick = (tick: number) => {
    if (isPrivacyMode) return "***";
    if (Math.abs(tick) >= 1000000) return `Rp${(tick / 1000000).toFixed(1)}M`
    if (Math.abs(tick) >= 1000) return `Rp${(tick / 1000).toFixed(0)}K`
    return formatCurrency(tick, isPrivacyMode)
  }

  const formatXAxisTick = (value: string) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
  }
  
  const trendColor = React.useMemo(() => {
    return trend === 'up'
      ? chartConfig.positive.color
      : trend === 'down'
      ? chartConfig.negative.color
      : chartConfig.neutral.color;
  }, [trend]);


  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Net Worth Trend</CardTitle>
            <CardDescription>Your cumulative net worth over time.</CardDescription>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
            <Button variant={range === '1y' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href={`/reports?range=1y&period=${period}&spendingPeriod=${spendingPeriod}`} scroll={false}>1 Year</Link>
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
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={trendColor} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={trendColor} stopOpacity={0.1} />
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
                        domain={['dataMin - 100000', 'dataMax + 100000']}
                    />
                    <ChartTooltipWrapper
                        cursor={true}
                        content={<CustomTooltip />}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <Area 
                      dataKey="netWorth" 
                      type="monotone" 
                      stroke={trendColor}
                      fill="url(#fill-gradient)"
                      strokeWidth={2} 
                    />
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
