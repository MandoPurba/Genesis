
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Scale, PiggyBank, Activity, Percent, List, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import { OverviewChart } from "@/components/overview-chart"
import { formatCurrency } from "@/lib/utils"
import { RightColumnTabs } from "@/components/right-column-tabs"
import { BudgetStatus, type BudgetStatusData } from "@/components/budget-status"
import { IncomeBreakdownChart, type CategoryData } from "@/components/income-breakdown-chart"
import { AccountBalancesCard, type AccountData } from "@/components/account-balances-card"


// Helper function to get start and end of a month
const getMonthDateRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    return {
        start: firstDay.toISOString(),
        end: lastDay.toISOString(),
    };
};

// Helper function to get start and end of a year
const getYearDateRange = (date: Date) => {
    const year = date.getFullYear();
    const firstDay = new Date(Date.UTC(year, 0, 1));
    const lastDay = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return {
        start: firstDay.toISOString(),
        end: lastDay.toISOString(),
    };
}

export default async function OverviewPage({ searchParams }: { searchParams: { range?: string } }) {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase not configured.</div>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect('/login');
  }

  // --- Consolidated Data Fetching ---
  const [accountsResult, transactionsResult] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, name, type')
      .eq('user_id', user.id),
    supabase
      .from('transactions')
      .select('id, date, type, amount, description, account_id, to_account_id, categories(id, name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false }),
  ]);

  const { data: accountsRaw, error: accountsError } = accountsResult;
  const { data: allTransactions, error: allTransactionsError } = transactionsResult;

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError);
    return <div>Error loading account data.</div>;
  }
  
  if (allTransactionsError) {
    console.error("Error fetching transactions:", allTransactionsError);
    return <div>Error loading data. Please check the console for details.</div>
  }

  const transactions = allTransactions || [];
  const now = new Date();

  // --- Derivations for Stat Cards ---
  const totalNetWorth = transactions.reduce((acc, t) => {
    if (t.type === 'income') return acc + t.amount;
    if (t.type === 'expense') return acc - t.amount;
    return acc; // Ignore transfers for net worth calculation
  }, 0);

  const currentMonthRange = getMonthDateRange(now);
  const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toISOString() >= currentMonthRange.start && tDate.toISOString() <= currentMonthRange.end;
  });

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthRange = getMonthDateRange(lastMonthDate);
  const lastMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toISOString() >= lastMonthRange.start && tDate.toISOString() <= lastMonthRange.end;
  });

  const calculateTotals = (trans: typeof transactions) => {
      return trans.reduce((acc, t) => {
          if (t.type === 'income') acc.income += t.amount;
          else if (t.type === 'expense') acc.expense += t.amount;
          return acc;
      }, { income: 0, expense: 0 });
  };
  
  const currentTotals = calculateTotals(currentMonthTransactions);
  const lastMonthTotals = calculateTotals(lastMonthTransactions);

  const incomePercentageChange =
      lastMonthTotals.income > 0
          ? ((currentTotals.income - lastMonthTotals.income) / lastMonthTotals.income) * 100
          : currentTotals.income > 0 ? Infinity : 0;

  const expensePercentageChange =
      lastMonthTotals.expense > 0
          ? ((currentTotals.expense - lastMonthTotals.expense) / lastMonthTotals.expense) * 100
          : currentTotals.expense > 0 ? Infinity : 0;

  const netBalance = currentTotals.income - currentTotals.expense;

  const renderPercentageChange = (change: number, positiveIsGood: boolean) => {
    if (!isFinite(change)) {
        return <p className="text-xs text-muted-foreground">No data last month</p>;
    }
    const isPositive = change >= 0;
    const colorClass = positiveIsGood
        ? (isPositive ? 'text-success' : 'text-destructive')
        : (isPositive ? 'text-destructive' : 'text-success');
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    return (
        <p className={`flex items-center text-xs ${colorClass}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            {Math.abs(change).toFixed(1)}% from last month
        </p>
    );
  };
  
  // --- Data for Main Overview Chart ---
  const range = searchParams.range === 'yearly' ? 'yearly' : 'monthly';
  let overviewChartData: { date: string; income: number; expense: number }[] = [];

  if (range === 'monthly') {
      const dailyData = new Map<string, { income: number; expense: number }>();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyData.set(formattedDate, { income: 0, expense: 0 });
      }

      currentMonthTransactions.forEach(t => {
          const transactionDate = new Date(t.date);
          const formattedDate = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const dayEntry = dailyData.get(formattedDate);
          if (dayEntry) {
              if (t.type === 'income') dayEntry.income += t.amount;
              else if (t.type === 'expense') dayEntry.expense += t.amount;
          }
      });
      overviewChartData = Array.from(dailyData.entries()).map(([date, totals]) => ({ date, ...totals }));
  } else { // yearly
      const yearlyTransactions = transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
      
      const monthlyData = new Map<string, { income: number; expense: number }>();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for(const monthName of monthNames) {
        monthlyData.set(monthName, { income: 0, expense: 0 });
      }

      yearlyTransactions.forEach(t => {
          const transactionDate = new Date(t.date);
          const monthName = monthNames[transactionDate.getMonth()];
          const monthEntry = monthlyData.get(monthName);
          if (monthEntry) {
              if (t.type === 'income') monthEntry.income += t.amount;
              else if (t.type === 'expense') monthEntry.expense += t.amount;
          }
      });
      overviewChartData = Array.from(monthlyData.entries()).map(([date, totals]) => ({ date, ...totals }));
  }

  // --- Data for Right Column ---
  const recentTransactions = transactions.slice(0, 4);

  const categoryExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
        const categoryName = t.categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
    }, {} as { [key: string]: number });

  const categoryExpenseData = Object.entries(categoryExpenses)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

  // --- New Analytics Cards Data ---
  const averageDailySpend = currentTotals.expense > 0 ? currentTotals.expense / now.getDate() : 0;
  const savingsRate = currentTotals.income > 0 ? (netBalance / currentTotals.income) * 100 : 0;
  const totalTransactionsThisMonth = currentMonthTransactions.length;
  const topSpendingCategory = categoryExpenseData.length > 0 ? categoryExpenseData[0] : null;

  // --- Data for New Bottom Row Cards ---
  const { data: budgets } = await supabase
    .from('budgets')
    .select('id, amount, categories (id, name)')
    .eq('user_id', user.id)
    .eq('start_date', currentMonthRange.start.split('T')[0]);
  
  const budgetsWithSpending: BudgetStatusData[] = (budgets || []).map(b => {
    const spent = b.categories ? categoryExpenses[b.categories.name] || 0 : 0;
    const progress = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return {
      id: b.id,
      name: b.categories?.name || "Uncategorized",
      amount: b.amount,
      spent: spent,
      progress: progress
    }
  }).sort((a, b) => b.progress - a.progress); // Sort by most spent first

  const incomeByCategory = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
        const categoryName = t.categories?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
    }, {} as { [key: string]: number });

  const incomeByCategoryData: CategoryData[] = Object.entries(incomeByCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

  // --- Calculate Account Balances for new card ---
  const accountBalances = new Map<number, number>();
  (accountsRaw || []).forEach(acc => {
    accountBalances.set(acc.id, 0);
  });

  transactions.forEach(t => {
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
  
  const accountsWithBalances: AccountData[] = (accountsRaw || []).map(acc => ({
    id: acc.id,
    name: acc.name,
    type: acc.type || 'Other',
    balance: accountBalances.get(acc.id) || 0,
  })).sort((a,b) => b.balance - a.balance);


  return (
    <div className="space-y-4">
      {/* Top Row: Main Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income (This Month)</CardTitle>
            <DollarSign className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(currentTotals.income)}</div>
            {renderPercentageChange(incomePercentageChange, true)}
          </CardContent>
        </Card>
        
        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
            <Wallet className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(currentTotals.expense)}</div>
            {renderPercentageChange(expensePercentageChange, false)}
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net (This Month)</CardTitle>
            <Scale className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">This month's income minus expenses.</p>
          </CardContent>
        </Card>
        
        {/* Total Net Worth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
            <PiggyBank className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalNetWorth >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {formatCurrency(totalNetWorth)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of all your account balances.</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: New Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Daily Spend</CardTitle>
                <Activity className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(averageDailySpend)}</div>
                <p className="text-xs text-muted-foreground">Average daily expense this month.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <Percent className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Percentage of income saved.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <List className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalTransactionsThisMonth}</div>
                <p className="text-xs text-muted-foreground">Total transactions this month.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Top Expense</CardTitle>
                <Trophy className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {topSpendingCategory ? (
                    <>
                        <div className="text-2xl font-bold">{topSpendingCategory.category}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">{formatCurrency(topSpendingCategory.total)}</span> spent this month.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">No expenses this month.</p>
                    </>
                )}
            </CardContent>
        </Card>
      </div>


      {/* Third Row: Charts & Other Info */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <OverviewChart data={overviewChartData} range={range} />
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-1">
            <RightColumnTabs 
              categoryData={categoryExpenseData} 
              transactions={recentTransactions}
              totalTransactions={transactions.length}
            />
        </div>
      </div>
      
      {/* Fourth Row: New Analytics */}
       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BudgetStatus budgets={budgetsWithSpending} />
          <IncomeBreakdownChart incomeData={incomeByCategoryData} />
          <AccountBalancesCard accounts={accountsWithBalances} />
       </div>

    </div>
  )
}
