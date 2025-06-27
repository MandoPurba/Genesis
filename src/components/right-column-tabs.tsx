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
}

export function RightColumnTabs({ categoryData, transactions }: RightColumnTabsProps) {
    return (
        <Card className="flex flex-col">
            <Tabs defaultValue="categories" className="flex flex-col">
                <div className="p-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="categories">Expense Categories</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="categories">
                    <CategoryChart data={categoryData} />
                </TabsContent>
                <TabsContent value="recent">
                    <RecentTransactions transactions={transactions} />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
