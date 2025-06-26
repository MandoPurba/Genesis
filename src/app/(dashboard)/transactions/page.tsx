import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { fetchTransactions } from "./actions";
import { TransactionsTable } from "@/components/transactions-table";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch initial data for the table and the form
  const initialTransactions = await fetchTransactions(0);
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View, search, and manage all your transactions.</CardDescription>
        </div>
        <AddTransactionSheet categories={categories || []} />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <TransactionsTable initialTransactions={initialTransactions || []} />
      </CardContent>
    </Card>
  )
}
