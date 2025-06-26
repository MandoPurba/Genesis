"use client"

import type { BudgetWithSpending } from "@/app/(dashboard)/budgets/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, IconForCategory } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BudgetItem({ budget }: { budget: BudgetWithSpending }) {
  const { categories, amount, spent, remaining } = budget;
  const progress = amount > 0 ? (spent / amount) * 100 : 0;

  const getProgressColor = () => {
    if (progress > 100) return 'hsl(var(--destructive))';
    if (progress > 80) return 'hsl(var(--chart-3))'; // Use theme's orange/yellow
    return 'hsl(var(--primary))';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <IconForCategory categoryName={categories?.name || 'Uncategorized'} />
                <CardTitle className="text-lg font-medium">{categories?.name || 'Uncategorized'}</CardTitle>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="space-y-1">
            <div className="flex justify-between items-baseline">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-sm text-muted-foreground">Budget</p>
            </div>
            <div className="flex justify-between items-baseline font-medium">
                <span className={cn(progress > 100 ? "text-destructive" : "text-foreground")}>
                    {formatCurrency(spent)}
                </span>
                <span>{formatCurrency(amount)}</span>
            </div>
        </div>
        
        <Progress 
            value={Math.min(progress, 100)} 
            style={{'--progress-color': getProgressColor()} as React.CSSProperties} 
            className="h-2"
        />

        <div className="text-right text-sm">
            {remaining >= 0 ? (
                <p className="text-muted-foreground">{formatCurrency(remaining)} remaining</p>
            ) : (
                <p className="text-destructive font-medium">{formatCurrency(Math.abs(remaining))} over budget</p>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
