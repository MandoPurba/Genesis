
"use client"

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryChart, type CategoryExpenseData } from "./category-chart";
import { RecentTransactions } from "./recent-transactions";

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

type RightColumnTabsProps = {
    categoryData: Omit<CategoryExpenseData, 'fill'>[];
    transactions: Transaction[];
    hasMoreTransactions: boolean;
}

export function RightColumnTabs({ categoryData, transactions, hasMoreTransactions }: RightColumnTabsProps) {
    return (
        <Card className="flex flex-col h-full">
            <Tabs defaultValue="categories" className="flex flex-col h-full">
                <div className="p-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="categories" className="flex-1 overflow-y-auto min-h-0">
                    <CategoryChart data={categoryData} />
                </TabsContent>
                <TabsContent value="recent" className="p-6 pt-0">
                    <RecentTransactions transactions={transactions} hasMore={hasMoreTransactions} />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
