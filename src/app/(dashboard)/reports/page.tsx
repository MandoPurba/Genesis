import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { SpendingReportChart } from "@/components/spending-report-chart"
import { NetWorthReportChart } from "@/components/net-worth-report-chart"

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

export default async function ReportsPage({ searchParams }: { searchParams: { range?: string } }) {
    const supabase = createClient();
    if (!supabase) {
        return <div>Supabase not configured.</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // --- Fetch ALL transactions for all reports ---
    const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('date, type, amount, categories(id, name)')
        .eq('user_id', user.id)
        .order('date', { ascending: true }) // Order chronologically for net worth calculation

    if (error) {
        console.error("Error fetching transactions for reports:", error);
        return <div>Error loading report data.</div>
    }

    const transactions = allTransactions || [];
    const now = new Date();

    // --- Monthly Report Calculations ---
    const currentMonthRange = getMonthDateRange(now);
    const monthlyTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toISOString() >= currentMonthRange.start && tDate.toISOString() <= currentMonthRange.end;
    });

    const { totalIncome, totalExpense } = monthlyTransactions.reduce(
        (acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else if (t.type === 'expense') acc.totalExpense += t.amount;
            return acc;
        },
        { totalIncome: 0, totalExpense: 0 }
    );
    const netFlow = totalIncome - totalExpense;

    const spendingByCategory = monthlyTransactions
        .filter(t => t.type === 'expense' && t.categories)
        .reduce((acc, t) => {
            const categoryName = t.categories!.name;
            acc[categoryName] = (acc[categoryName] || 0) + t.amount;
            return acc;
        }, {} as { [key: string]: number });

    const spendingDataForChart = Object.entries(spendingByCategory)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

    // --- Net Worth Trend Calculations ---
    let cumulativeNetWorth = 0;
    const netWorthDataFull = transactions.map(t => {
        if (t.type === 'income') {
            cumulativeNetWorth += t.amount;
        } else if (t.type === 'expense') {
            cumulativeNetWorth -= t.amount;
        }
        return {
            date: t.date,
            netWorth: cumulativeNetWorth
        };
    });

    const validRanges = ['1y', '5y', 'all'] as const;
    type Range = typeof validRanges[number];
    const range: Range = validRanges.includes(searchParams.range as any) ? searchParams.range as Range : '5y';
    
    let netWorthDataFiltered = netWorthDataFull;
    const today = new Date();

    if (range === '1y') {
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        netWorthDataFiltered = netWorthDataFull.filter(d => new Date(d.date) >= oneYearAgo);
    } else if (range === '5y') {
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
        netWorthDataFiltered = netWorthDataFull.filter(d => new Date(d.date) >= fiveYearsAgo);
    }
    
    return (
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>
                        Dive deep into your financial history and trends.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Net Worth Chart */}
             <div className="grid grid-cols-1 gap-4">
                <NetWorthReportChart data={netWorthDataFiltered} range={range} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Snapshot</CardTitle>
                    <CardDescription>
                        Your financial summary for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Top Row: Main Stat Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Total Income */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="w-5 h-5 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
                        <p className="text-xs text-muted-foreground">Total income this month.</p>
                    </CardContent>
                </Card>
                
                {/* Total Expenses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="w-5 h-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
                        <p className="text-xs text-muted-foreground">Total expenses this month.</p>
                    </CardContent>
                </Card>

                {/* Net Flow */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(netFlow)}
                        </div>
                        <p className="text-xs text-muted-foreground">Income minus expenses.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Spending Chart */}
            <div className="grid grid-cols-1 gap-4">
                <SpendingReportChart data={spendingDataForChart} />
            </div>

        </div>
    )
}
