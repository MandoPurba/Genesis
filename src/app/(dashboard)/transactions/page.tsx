
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { fetchTransactions } from "./actions";
import { TransactionsTable } from "@/components/transactions-table";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { redirect } from "next/navigation";

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
  const [initialTransactions, categoriesData, accountsData, allTransactionsResult] = await Promise.all([
    fetchTransactions(0),
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name'),
    supabase.from('transactions').select('account_id, to_account_id, type, amount').eq('user_id', user.id) // Fetch all transactions for balance calculation
  ]);

  const categories = categoriesData.data || [];
  const accountsRaw = accountsData.data || [];
  const allTransactions = allTransactionsResult.data || [];

  if (allTransactionsResult.error) {
    console.error("Error fetching transactions for balance calculation:", allTransactionsResult.error);
    // You might want to return an error view here
  }

  // --- Calculate Account Balances ---
  const accountBalances = new Map<number, number>();
  accountsRaw.forEach(acc => {
    accountBalances.set(acc.id, 0);
  });

  allTransactions.forEach(t => {
    if (t.type === 'transfer') {
      if (t.account_id) {
        const fromBalance = accountBalances.get(t.account_id) || 0;
        accountBalances.set(t.account_id, fromBalance - t.amount);
      }
      if (t.to_account_id) {
        const toBalance = accountBalances.get(t.to_account_id) || 0;
        accountBalances.set(t.to_account_id, toBalance + t.amount);
      }
    } else {
      if (t.account_id) {
        const currentBalance = accountBalances.get(t.account_id) || 0;
        const adjustment = t.type === 'income' ? t.amount : -t.amount;
        accountBalances.set(t.account_id, currentBalance + adjustment);
      }
    }
  });

  const accounts = accountsRaw.map(acc => ({
    id: acc.id,
    name: acc.name,
    balance: accountBalances.get(acc.id) || 0,
  }));
  // --- End Account Balance Calculation ---


  // --- Logic to get budget and spending data for the current month ---
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
  // --- End budget logic ---


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
