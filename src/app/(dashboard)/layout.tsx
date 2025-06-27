

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"
import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MobileBlocker } from "@/components/mobile-blocker"
import { GlobalSearch } from "@/components/global-search"
import { PrivacyProvider } from "@/contexts/privacy-context"
import { PrivacyToggle } from "@/components/privacy-toggle"
import { AddTransactionSheet } from "@/components/add-transaction-sheet"
import type { BudgetInfo } from "./transactions/page"


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  if (!supabase) {
    return <SupabaseConfigWarning />
  }
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // --- Data Fetching for Global Components ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';

  const userForNav = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
      }
    }

  // --- Data for Global Add Transaction Sheet ---
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthStartDateISO = new Date(year, month, 1).toISOString();
  const monthEndDateISO = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
  const currentMonthStartDateString = new Date(year, month, 1).toISOString().split('T')[0];

  const [categoriesData, accountsData, allTransactionsResult, budgetsResult, monthlyTransactionsResult] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name'),
    supabase.from('transactions').select('account_id, to_account_id, type, amount').eq('user_id', user.id),
    supabase.from('budgets').select('amount, category_id').eq('user_id', user.id).eq('start_date', currentMonthStartDateString),
    supabase.from('transactions').select('amount, category_id').eq('user_id', user.id).eq('type', 'expense').gte('date', monthStartDateISO).lte('date', monthEndDateISO)
  ]);
  
  const categories = categoriesData.data || [];
  const accountsRaw = accountsData.data || [];
  const allTransactions = allTransactionsResult.data || [];
  const budgets = budgetsResult.data || [];
  const monthlyTransactions = monthlyTransactionsResult.data || [];

  const accountBalances = new Map<number, number>();
  accountsRaw.forEach(acc => accountBalances.set(acc.id, 0));
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
  // --- End Data Fetching ---

  return (
    <PrivacyProvider>
      <MobileBlocker>
        <SidebarProvider>
          <div className="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
              <header className="flex items-center justify-between gap-4 p-4 pb-0">
                  <div className="flex items-center gap-4">
                      <SidebarTrigger className="md:hidden" />
                      <div className="flex items-center gap-4 pl-4 md:pl-0">
                          <svg
                              role="img"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-primary flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                              <path d="M12 12a4 4 0 1 0-4-4" />
                          </svg>
                          <div>
                              <h1 className="text-lg font-semibold md:text-2xl">Hello, {userName}!</h1>
                              <p className="text-sm text-muted-foreground">Welcome to your financial dashboard.</p>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="relative hidden md:block w-64">
                        <GlobalSearch />
                      </div>
                      <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <PrivacyToggle />
                          <AddTransactionSheet categories={categories} accounts={accounts} budgetInfo={budgetInfo} />
                      </div>
                  </div>
              </header>

              <div className="grid grid-cols-[auto_1fr] gap-4 p-4 pt-6 overflow-y-hidden">
                <Sidebar side="left" variant="floating" collapsible="icon" className="z-40">
                  <SidebarContent className="pt-2">
                    <MainNav />
                  </SidebarContent>
                  <SidebarFooter className="pb-2">
                    <UserNav user={userForNav} />
                  </SidebarFooter>
                </Sidebar>

                <main className="overflow-y-auto">
                  {children}
                </main>
            </div>
          </div>
        </SidebarProvider>
      </MobileBlocker>
    </PrivacyProvider>
  )
}
