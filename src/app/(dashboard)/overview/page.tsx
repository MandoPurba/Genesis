
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Scale, PiggyBank } from "lucide-react"
import { redirect } from "next/navigation"
import { OverviewChart } from "@/components/overview-chart"
import { formatCurrency } from "@/lib/utils"
import { RightColumnTabs } from "@/components/right-column-tabs"

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

  // --- Single, consolidated data fetch for all transaction-related data ---
  const { data: allTransactions, error: allTransactionsError } = await supabase
    .from('transactions')
    .select('id, date, type, amount, description, categories ( name )')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

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
  const recentTransactions = transactions.slice(0, 7);

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

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Row: Stat Cards */}
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
        
        {/* NEW: Total Net Worth */}
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

      {/* Bottom Row: Charts & Other Info */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3 overflow-hidden min-h-0">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <OverviewChart data={overviewChartData} range={range} />
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-1">
            <RightColumnTabs 
              categoryData={categoryExpenseData} 
              transactions={recentTransactions}
              hasMoreTransactions={transactions.length > 7}
            />
        </div>
      </div>
    </div>
  )
}
