import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, BarChart, Scale } from "lucide-react"
import { redirect } from "next/navigation"

// Helper function to format currency
const formatCurrency = (amount: number | null) => {
  if (amount === null || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get start and end of a month
const getMonthDateRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return {
        start: firstDay.toUTCString(),
        end: lastDay.toUTCString(),
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
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(now.getMonth() - 1);

  const currentMonthRange = getMonthDateRange(now);
  const lastMonthRange = getMonthDateRange(lastMonthDate);

  const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', user.id)
      .gte('date', lastMonthRange.start)
      .lte('date', currentMonthRange.end);

  if (error) {
      console.error("Error fetching transactions:", error);
      // You can return a dedicated error component here
      return <div>Error loading data.</div>
  }
  
  const currentMonthTransactions = transactions?.filter(t => new Date(t.date) >= new Date(currentMonthRange.start)) || [];
  const lastMonthTransactions = transactions?.filter(t => new Date(t.date) < new Date(currentMonthRange.start)) || [];

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
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>A visual representation of your cash flow.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center flex-1">
            <div data-ai-hint="bar chart" className="flex items-center justify-center w-full h-full rounded-lg bg-muted/50">
              <BarChart className="w-16 h-16 text-muted-foreground/50"/>
            </div>
          </CardContent>
        </Card>
        
        {/* Side Cards */}
        <div className="flex flex-col col-span-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>Monthly spending vs budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mx-auto w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" className="stroke-current text-secondary" strokeWidth="4" fill="none" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" className="stroke-current text-primary" strokeWidth="4" fill="none" strokeDasharray="65, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">65%</span>
                      <span className="text-xs text-muted-foreground">Used</span>
                  </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col flex-1">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center flex-1">
               <div data-ai-hint="pie chart" className="flex items-center justify-center w-full h-full rounded-lg bg-muted/50">
                 <Activity className="w-16 h-16 text-muted-foreground/50"/>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
