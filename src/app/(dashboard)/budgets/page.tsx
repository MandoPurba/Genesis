import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BudgetItem } from "@/components/budget-item";
import { AddBudgetSheet } from "@/components/add-budget-sheet";
import { FileSearch } from "lucide-react";

// Updated type to match schema (bigint -> number)
export type BudgetWithSpending = {
  id: number;
  amount: number;
  spent: number;
  remaining: number;
  categories: {
    id: number;
    name: string;
  } | null;
};

export default async function BudgetsPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Updated SQL to match provided schema
  const createBudgetsTableSql = `CREATE TYPE budget_period AS ENUM ('monthly', 'yearly');

CREATE TABLE budgets (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  period budget_period NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, start_date)
);`;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11 for Date object

  const currentMonthStartDate = new Date(year, month, 1);
  const currentMonthStartDateString = currentMonthStartDate.toISOString().split('T')[0];

  // Fetch categories and budgets in parallel, scoped to the current user
  const [categoriesResult, budgetsResult] = await Promise.all([
    supabase.from('categories').select('id, name, type').eq('user_id', user.id).eq('type', 'expense'),
    supabase
      .from('budgets')
      .select('id, amount, category_id')
      .eq('user_id', user.id)
      .eq('start_date', currentMonthStartDateString) // Filter by start date of the current month
  ]);
  
  const { data: allCategories, error: categoriesError } = categoriesResult;
  const { data: budgets, error: budgetsError } = budgetsResult;

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return <div>Error loading category data.</div>;
  }

  if (budgetsError) {
    console.error("Error fetching budgets:", budgetsError);
    if (budgetsError.code === '42P01') { // relation "budgets" does not exist
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Budgets Feature Not Ready</CardTitle>
                    <CardDescription>
                       To manage budgets, you first need to create a `budgets` table in your database.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Please run the following command in your Supabase SQL Editor to set it up:</p>
                    <pre className="p-4 bg-muted text-sm rounded-md overflow-x-auto">
                      {createBudgetsTableSql}
                    </pre>
                </CardContent>
            </Card>
        )
    }
    return <div>Error loading budgets. Please check the console for details.</div>
  }

  const categoryMap = new Map((allCategories || []).map(c => [c.id, c]));

  const monthStartDateISO = new Date(year, month, 1).toISOString();
  const monthEndDateISO = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', monthStartDateISO)
    .lte('date', monthEndDateISO);

  if (transactionsError) {
    console.error("Error fetching transactions for budgets:", transactionsError);
    return <div>Error loading transaction data.</div>
  }
  
  const spendingByCategory: { [key: number]: number } = (transactions || []).reduce((acc, t) => {
      if (t.category_id) {
          acc[t.category_id] = (acc[t.category_id] || 0) + t.amount;
      }
      return acc;
  }, {} as { [key: number]: number });

  const budgetsWithSpending: BudgetWithSpending[] = (budgets || []).map(b => {
    const spent = b.category_id ? spendingByCategory[b.category_id] || 0 : 0;
    const categoryInfo = b.category_id ? categoryMap.get(b.category_id) : null;
    return {
      id: b.id,
      amount: b.amount,
      categories: categoryInfo ? { id: categoryInfo.id, name: categoryInfo.name } : null,
      spent,
      remaining: b.amount - spent,
    };
  }).sort((a, b) => (a.remaining) - (b.remaining));

  const categoriesForSheet = (allCategories || []).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Monthly Budgets</CardTitle>
                <CardDescription>Manage your spending limits for each category for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}.</CardDescription>
            </div>
            <AddBudgetSheet categories={categoriesForSheet} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        {budgetsWithSpending.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetsWithSpending.map(budget => (
              <BudgetItem key={budget.id} budget={budget} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10">
            <FileSearch className="w-16 h-16 text-muted-foreground/50"/>
            <h3 className="text-lg font-semibold mt-4">No Budgets Set</h3>
            <p className="text-muted-foreground">You haven't set any budgets for this month yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
