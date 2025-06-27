
"use client"

import * as React from "react"
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis, Legend, Cell, TooltipProps } from "recharts"
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
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type ServerData = {
    name: string;
    total: number;
}
type ChartData = ServerData & {
    x: number;
    y: number;
}

type ReportProps = {
  data: ServerData[];
  period: 'this_year' | 'last_year';
}

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const data: ChartData = payload[0].payload;
        return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
            <div className="flex flex-col">
                <span className="font-bold text-foreground">{data.name}</span>
                <span className="text-sm text-muted-foreground">{formatCurrency(data.total)}</span>
            </div>
        </div>
        );
    }
    return null;
};

export function SpendingByCategoryReport({ data, period }: ReportProps) {
  const chartData = React.useMemo(() => {
    // Adding random positions on the client to avoid hydration mismatch
    return data.map(item => ({
        ...item,
        x: Math.random() * 100,
        y: Math.random() * 100,
    }))
  }, [data]);

  const chartConfig = React.useMemo(() => {
    return data.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [data]);

  const hasData = data.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Visual comparison of total spending for {period === 'this_year' ? 'this year' : 'last year'}.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        {hasData ? (
          <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" name="x" tick={false} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="y" name="y" tick={false} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="total" range={[200, 2500]} name="total" />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />
              <Legend />
              <Scatter name="Categories" data={chartData} fill="var(--color-primary)">
                 {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                 ))}
              </Scatter>
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
