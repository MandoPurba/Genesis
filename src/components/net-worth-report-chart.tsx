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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  netWorth: {
    label: "Net Worth",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type NetWorthReportChartProps = {
  data: { date: string; netWorth: number }[];
  range: '1y' | '5y' | 'all';
}

export function NetWorthReportChart({ data, range }: NetWorthReportChartProps) {

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
              <Link href="/reports?range=1y">Last Year</Link>
            </Button>
            <Button variant={range === '5y' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href="/reports?range=5y">5 Years</Link>
            </Button>
            <Button variant={range === 'all' ? 'secondary' : 'ghost'} size="sm" className="h-7" asChild>
              <Link href="/reports?range=all">All Time</Link>
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
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-netWorth)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-netWorth)" stopOpacity={0}/>
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
                        content={
                            <ChartTooltipContent
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                formatter={(value, name) => (
                                    <div className="flex items-center justify-between w-full min-w-[120px]">
                                        <span>Net Worth</span>
                                        <span className="ml-4 font-semibold">{formatCurrency(Number(value))}</span>
                                    </div>
                                )}
                                itemStyle={{width: '100%'}}
                            />
                        }
                    />
                    <Area
                        dataKey="netWorth"
                        type="monotone"
                        stroke="var(--color-netWorth)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorNetWorth)"
                        name="Net Worth"
                        dot={false}
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
