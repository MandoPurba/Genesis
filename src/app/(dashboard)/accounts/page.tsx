import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddAccountSheet } from "@/components/add-account-sheet";
import { FileSearch } from "lucide-react";
import { formatCurrency, IconForAccountType } from "@/lib/utils";
import { cookies } from "next/headers";

export type Account = {
  id: number;
  name: string;
  type: string | null;
  balance: number;
};

export default async function AccountsPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase client not available.</div>;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const isPrivacyMode = cookies().get('privacy-mode')?.value === 'true';

  const [accountsResult, transactionsResult] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, name, type')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('transactions')
      .select('account_id, to_account_id, type, amount')
      .eq('user_id', user.id)
  ]);
  
  const { data: accountsData, error: accountsError } = accountsResult;
  const { data: transactions, error: transactionsError } = transactionsResult;
  
  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
    if (accountsError.code === '42P01') { // relation "accounts" does not exist
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Accounts Feature Not Ready</CardTitle>
                    <CardDescription>
                       To manage accounts, you first need to create the necessary tables in your database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">This feature depends on the `accounts` table. Please ensure it's set up in your Supabase project.</p>
                </CardContent>
            </Card>
        )
    }
    return <div>Error loading accounts. Please check the console for details.</div>
  }

  if (transactionsError) {
    console.error("Error fetching transactions for balance calculation:", transactionsError);
    return <div>Error loading transaction data.</div>
  }

  const calculatedBalances = new Map<number, number>();
  // Initialize all accounts with a balance of 0
  (accountsData || []).forEach(acc => {
    calculatedBalances.set(acc.id, 0);
  });

  // Apply transaction amounts
  (transactions || []).forEach(t => {
    if (t.type === 'transfer') {
      // For transfers, decrease 'from' account and increase 'to' account
      if (t.account_id) {
        const fromBalance = calculatedBalances.get(t.account_id) || 0;
        calculatedBalances.set(t.account_id, fromBalance - t.amount);
      }
      if (t.to_account_id) {
        const toBalance = calculatedBalances.get(t.to_account_id) || 0;
        calculatedBalances.set(t.to_account_id, toBalance + t.amount);
      }
    } else {
      // For income/expense, adjust the primary account
      if (t.account_id) {
        const currentBalance = calculatedBalances.get(t.account_id) || 0;
        const adjustment = t.type === 'income' ? t.amount : -t.amount;
        calculatedBalances.set(t.account_id, currentBalance + adjustment);
      }
    }
  });

  // Map accounts and add the calculated balance
  const accounts: Account[] = (accountsData || []).map(acc => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: calculatedBalances.get(acc.id) || 0,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>View and manage your financial accounts.</CardDescription>
            </div>
            <AddAccountSheet />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">
        {accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <Card key={account.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconForAccountType accountType={account.type || 'Other'} className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl">{account.name}</CardTitle>
                  </div>
                   <CardDescription>{account.type || 'General Account'}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(account.balance, isPrivacyMode)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center rounded-lg bg-muted/50 p-10">
            <FileSearch className="w-16 h-16 text-muted-foreground/50"/>
            <h3 className="text-lg font-semibold mt-4">No Accounts Found</h3>
            <p className="text-muted-foreground">Get started by adding your first financial account.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
