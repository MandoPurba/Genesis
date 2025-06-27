
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

const chartConfig = {
  netFlow: { label: "Net Flow" },
  positive: { color: "hsl(var(--success))" },
  negative: { color: "hsl(var(--destructive))" },
} satisfies ChartConfig

type NetWorthReportChartProps = {
  data: { date: string; netFlow: number }[];
  range: '1y' | '5y' | 'all';
  period: 'this_year' | 'last_year';
  spendingPeriod: 'this_year' | 'last_year';
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.netFlow >= 0;
      return (
        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">
            {new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
          <div className="flex w-full flex-wrap items-stretch gap-2">
            <div className="flex flex-1 justify-between leading-none">
              <span>Net Flow</span>
              <span className={`font-mono font-medium tabular-nums ml-4 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(data.netFlow)}
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
    if (Math.abs(tick) >= 1000000) return `Rp${(tick / 1000000).toFixed(1)}M`
    if (Math.abs(tick) >= 1000) return `Rp${(tick / 1000).toFixed(0)}K`
    return formatCurrency(tick)
  }

  const formatXAxisTick = (value: string) => {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
  }

  const gradientOffset = () => {
    if (data.length === 0) return 0.5;
    const dataMax = Math.max(...data.map((i) => i.netFlow));
    const dataMin = Math.min(...data.map((i) => i.netFlow));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();


  return (
    <Card>
       <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Net Cash Flow</CardTitle>
            <CardDescription>Your monthly income minus expenses.</CardDescription>
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
                        <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="var(--color-positive)" stopOpacity={0.4} />
                            <stop offset={off} stopColor="var(--color-negative)" stopOpacity={0.4} />
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
                    />
                    <ChartTooltipWrapper
                        cursor={true}
                        content={<CustomTooltip />}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <Area dataKey="netFlow" type="monotone" stroke="hsl(var(--foreground))" strokeWidth={2} fill="url(#splitColor)" dot={false} />
                </AreaChart>
            </ChartContainer>
         ) : (
            <div className="flex items-center justify-center w-full text-center rounded-lg bg-muted/50 p-4 min-h-[350px]">
                <p className="text-muted-foreground">Not enough data to display the net flow trend.</p>
            </div>
         )}
      </CardContent>
    </Card>
  )
}
