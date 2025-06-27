

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { fetchTransactions } from "./actions";
import { TransactionsTable } from "@/components/transactions-table";
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

  // Fetch only the initial transactions for the table.
  // The rest of the data for the add sheet is now handled in the layout.
  const initialTransactions = await fetchTransactions(0);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View, search, and manage all your transactions.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <TransactionsTable initialTransactions={initialTransactions || []} />
      </CardContent>
    </Card>
  )
}
