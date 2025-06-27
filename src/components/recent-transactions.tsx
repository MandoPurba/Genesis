
"use client"

import { ArrowRight } from "lucide-react"
import { formatCurrency, IconForCategory } from "@/lib/utils"

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

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
    return (
        <div className="p-6 pt-0">
            {transactions.length > 0 ? (
                <div className="space-y-6">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center">
                            <div className="flex-1 flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-full flex items-center justify-center">
                                  <IconForCategory 
                                    categoryName={transaction.type === 'transfer' ? 'Transfer' : (transaction.categories?.name || 'Uncategorized')} 
                                    className="text-muted-foreground" 
                                  />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {transaction.description || (transaction.type === 'transfer' ? 'Transfer' : transaction.categories?.name) || 'Transaction'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className={`ml-auto font-medium ${
                                transaction.type === 'income' ? 'text-success' 
                                : transaction.type === 'expense' ? 'text-destructive' 
                                : 'text-muted-foreground'
                              }`}>
                                {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
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
        </div>
    );
}
