
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddCategorySheet } from "@/components/add-category-sheet";
import { CategoryList } from "@/components/category-list";

export type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

export default async function CategoriesPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const [categoriesResult, transactionsResult] = await Promise.all([
    supabase
        .from('categories')
        .select('id, name, type')
        .eq('user_id', user.id)
        .order('name'),
    supabase
        .from('transactions')
        .select('category_id')
        .eq('user_id', user.id)
        .not('category_id', 'is', null)
  ]);
  
  const { data: categories, error } = categoriesResult;
  const { data: transactions, error: transactionsError } = transactionsResult;
  
  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Error loading categories.</div>;
  }

  if (transactionsError) {
    console.error("Error fetching transactions for category usage:", transactionsError);
    return <div>Error loading transaction data.</div>;
  }

  const usedCategoryIds = new Set((transactions || []).map(t => t.category_id!));

  const expenseCategories = (categories || []).filter(c => c.type === 'expense') as Category[];
  const incomeCategories = (categories || []).filter(c => c.type === 'income') as Category[];

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>View, create, and manage your spending and income categories.</CardDescription>
            </div>
            <AddCategorySheet />
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="expense" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Expense Categories</TabsTrigger>
                    <TabsTrigger value="income">Income Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="expense" className="mt-4">
                    <CategoryList title="Expense" categories={expenseCategories} usedCategoryIds={usedCategoryIds} />
                </TabsContent>
                <TabsContent value="income" className="mt-4">
                    <CategoryList title="Income" categories={incomeCategories} usedCategoryIds={usedCategoryIds} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  )
}
