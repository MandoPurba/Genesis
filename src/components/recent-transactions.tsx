"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
    ArrowRight,
    Briefcase,
    Car,
    FileText,
    Gift,
    HeartPulse,
    Home,
    Landmark,
    MoreHorizontal,
    ShoppingCart,
    Ticket,
    TrendingUp,
    Utensils,
    BookOpen
} from "lucide-react"
import Link from "next/link"

type Transaction = {
    id: number;
    date: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string | null;
    categories: {
        name: string;
    } | null;
}

const categoryIcons: { [key: string]: React.ElementType } = {
    'Food & Drinks': Utensils,
    'Transportation': Car,
    'Entertainment': Ticket,
    'Shopping': ShoppingCart,
    'Utility Bills': FileText,
    'Education': BookOpen,
    'Health': HeartPulse,
    'Rent': Home,
    'Salary': Briefcase,
    'Gifts': Gift,
    'Sales': TrendingUp,
    'Investments': Landmark,
    'Other': MoreHorizontal,
    'Uncategorized': MoreHorizontal,
};

function IconForCategory({ categoryName }: { categoryName: string }) {
    const Icon = categoryIcons[categoryName] || MoreHorizontal;
    return <Icon className="h-5 w-5 text-muted-foreground" />;
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    return (
        <Card className="flex flex-col flex-1">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                    Your last {transactions.length} transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pr-2">
                {transactions.length > 0 ? (
                    <div className="space-y-6">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center">
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="p-3 bg-secondary rounded-full flex items-center justify-center">
                                      <IconForCategory categoryName={transaction.categories?.name || 'Uncategorized'} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {transaction.description || transaction.categories?.name || 'Transaction'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">No recent transactions found.</p>
                        <p className="text-xs text-muted-foreground mt-1">When you add transactions, they will appear here.</p>
                    </div>
                )}
            </CardContent>
            {transactions.length > 0 && (
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/transactions">
                            View all <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
