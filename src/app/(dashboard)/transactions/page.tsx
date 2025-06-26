import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { fetchTransactions } from "./actions";
import { TransactionsTable } from "@/components/transactions-table";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export type BudgetInfo = {
  [categoryId: number]: {
    budget: number;
    spent: number;
  }
}

export default async function TransactionsPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch initial data for the table and the form, ensuring it's scoped to the user
  const [initialTransactions, categoriesData, accountsData] = await Promise.all([
    fetchTransactions(0),
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name')
  ]);

  const categories = categoriesData.data || [];
  const accounts = accountsData.data || [];


  // --- New logic to get budget and spending data ---
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthStartDateISO = new Date(year, month, 1).toISOString();
  const monthEndDateISO = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
  const currentMonthStartDateString = new Date(year, month, 1).toISOString().split('T')[0];

  const [budgetsResult, transactionsResult] = await Promise.all([
    supabase
      .from('budgets')
      .select('amount, category_id')
      .eq('user_id', user.id)
      .eq('start_date', currentMonthStartDateString),
    supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', monthStartDateISO)
      .lte('date', monthEndDateISO)
  ]);
  
  const { data: budgets, error: budgetsError } = budgetsResult;
  const { data: monthlyTransactions, error: transactionsError } = transactionsResult;

  if (budgetsError) console.error("Error fetching budgets for transaction sheet:", budgetsError);
  if (transactionsError) console.error("Error fetching monthly transactions for sheet:", transactionsError);

  const spendingByCategory: { [key: number]: number } = (monthlyTransactions || []).reduce((acc, t) => {
    if (t.category_id) {
        acc[t.category_id] = (acc[t.category_id] || 0) + t.amount;
    }
    return acc;
  }, {} as { [key: number]: number });
  
  const budgetInfo: BudgetInfo = (budgets || []).reduce((acc, b) => {
    if (b.category_id) {
        acc[b.category_id] = {
            budget: b.amount,
            spent: spendingByCategory[b.category_id] || 0
        };
    }
    return acc;
  }, {} as BudgetInfo);
  // --- End new logic ---


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View, search, and manage all your transactions.</CardDescription>
        </div>
        <AddTransactionSheet categories={categories} accounts={accounts} budgetInfo={budgetInfo} />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <TransactionsTable initialTransactions={initialTransactions || []} />
      </CardContent>
    </Card>
  )
}
