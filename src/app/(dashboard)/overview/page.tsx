import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Scale } from "lucide-react"
import { redirect } from "next/navigation"
import { OverviewChart } from "@/components/overview-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { formatCurrency } from "@/lib/utils"

// Helper function to get start and end of a month
const getMonthDateRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return {
        start: firstDay.toISOString(),
        end: lastDay.toISOString(),
    };
};


export default async function OverviewPage() {
  const supabase = createClient();
  if (!supabase) {
    return <div>Supabase not configured.</div>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      redirect('/login');
  }

  const now = new Date();
  const currentMonthRange = getMonthDateRange(now);
  
  const { data: currentMonthTransactions, error: currentMonthError } = await supabase
      .from('transactions')
      .select('amount, type, date, categories ( name )')
      .eq('user_id', user.id)
      .gte('date', currentMonthRange.start)
      .lte('date', currentMonthRange.end)
      .order('date', { ascending: true });

  if (currentMonthError) {
      console.error("Error fetching current month transactions:", currentMonthError);
      return <div>Error loading data.</div>
  }

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);
  const lastMonthRange = getMonthDateRange(lastMonthDate);

  const { data: lastMonthTransactions, error: lastMonthError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', lastMonthRange.start)
      .lte('date', lastMonthRange.end);
  
  if (lastMonthError) {
      console.error("Error fetching last month transactions:", lastMonthError);
      return <div>Error loading data.</div>
  }

  const { data: recentTransactions, error: recentTransactionsError } = await supabase
    .from('transactions')
    .select('id, date, type, amount, description, categories ( name )')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5);

  if (recentTransactionsError) {
      console.error("Error fetching recent transactions:", recentTransactionsError);
  }

  const calculateTotals = (trans: { amount: number; type: string; }[]) => {
      return trans.reduce((acc, t) => {
          if (t.type === 'income') {
              acc.income += t.amount;
          } else if (t.type === 'expense') {
              acc.expense += t.amount;
          }
          return acc;
      }, { income: 0, expense: 0 });
  };

  const currentTotals = calculateTotals(currentMonthTransactions || []);
  const lastMonthTotals = calculateTotals(lastMonthTransactions || []);

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

  // Prepare data for the overview chart
  const dailyData = new Map<string, { income: number; expense: number }>();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyData.set(formattedDate, { income: 0, expense: 0 });
  }

  (currentMonthTransactions || []).forEach(t => {
      const transactionDate = new Date(t.date);
      const formattedDate = transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayEntry = dailyData.get(formattedDate);

      if (dayEntry) {
          if (t.type === 'income') {
              dayEntry.income += t.amount;
          } else if (t.type === 'expense') {
              dayEntry.expense += t.amount;
          }
      }
  });

  const overviewChartData = Array.from(dailyData.entries()).map(([date, { income, expense }]) => ({
      date,
      income,
      expense
  }));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentTotals.income)}</div>
            {renderPercentageChange(incomePercentageChange, true)}
          </CardContent>
        </Card>
        
        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentTotals.expense)}</div>
            {renderPercentageChange(expensePercentageChange, false)}
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Scale className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netBalance)}</div>
            <p className="text-xs text-muted-foreground">This month's standing.</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Charts & Other Info */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main Chart */}
        <OverviewChart data={overviewChartData} />
        
        {/* Recent Transactions */}
        <RecentTransactions transactions={recentTransactions || []} />
      </div>
    </div>
  )
}
