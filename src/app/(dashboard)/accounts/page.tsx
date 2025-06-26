import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddAccountSheet } from "@/components/add-account-sheet";
import { FileSearch, Landmark } from "lucide-react";
import { formatCurrency, IconForAccountType } from "@/lib/utils";

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

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, name, type, balance')
    .eq('user_id', user.id)
    .order('name');
  
  if (error) {
    console.error("Error fetching accounts:", error);
    if (error.code === '42P01') { // relation "accounts" does not exist
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
                    <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
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
