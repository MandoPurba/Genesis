
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Target } from "lucide-react"

export type BudgetStatusData = {
    id: number;
    name: string;
    amount: number;
    spent: number;
    progress: number;
}

export function BudgetStatus({ budgets }: { budgets: BudgetStatusData[] }) {

    const getProgressColor = (progress: number) => {
        if (progress > 100) return 'hsl(var(--destructive))';
        if (progress > 80) return 'hsl(var(--chart-3))';
        return 'hsl(var(--primary))';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Budget Status</CardTitle>
                <CardDescription>
                    Your spending progress against your monthly budgets.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {budgets.length > 0 ? (
                    <div className="space-y-6">
                        {budgets.map((budget) => (
                            <div key={budget.id} className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-medium">{budget.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <span className={cn(
                                            "font-semibold",
                                            budget.progress > 100 ? "text-destructive" : "text-foreground"
                                        )}>
                                            {formatCurrency(budget.spent)}
                                        </span>
                                        <span className="mx-1">/</span>
                                        <span>{formatCurrency(budget.amount)}</span>
                                    </p>
                                </div>
                                <Progress
                                    value={Math.min(budget.progress, 100)}
                                    style={{ '--progress-color': getProgressColor(budget.progress) } as React.CSSProperties}
                                    className="h-2"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10">
                        <Target className="w-16 h-16 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mt-4">No Budgets Set</h3>
                        <p className="text-muted-foreground text-sm">Create a budget to track your spending.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

    