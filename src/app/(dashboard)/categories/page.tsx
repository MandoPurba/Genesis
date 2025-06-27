
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddCategorySheet } from "@/components/add-category-sheet";
import { FileSearch } from "lucide-react";
import { IconForCategory } from "@/lib/utils";

export type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

function CategoryList({ title, categories }: { title: string, categories: Category[] }) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10 min-h-[200px]">
                <FileSearch className="w-16 h-16 text-muted-foreground/50"/>
                <h3 className="text-lg font-semibold mt-4">No {title} Categories</h3>
                <p className="text-muted-foreground text-sm">Add a category to see it here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                        <IconForCategory categoryName={category.name} className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{category.name}</span>
                    </div>
                    {/* Placeholder for future actions */}
                </div>
            ))}
        </div>
    )
}

export default async function CategoriesPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Error loading categories.</div>;
  }

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
                    <CategoryList title="Expense" categories={expenseCategories} />
                </TabsContent>
                <TabsContent value="income" className="mt-4">
                    <CategoryList title="Income" categories={incomeCategories} />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  )
}
