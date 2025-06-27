
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NetWorthReportChart } from "@/components/net-worth-report-chart"
import { IncomeVsExpenseReport } from "@/components/income-vs-expense-report"
import { SpendingByCategoryReport } from "@/components/spending-by-category-report"

const getYearDateRange = (year: number) => {
    const firstDay = new Date(Date.UTC(year, 0, 1));
    const lastDay = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return {
        start: firstDay.toISOString(),
        end: lastDay.toISOString(),
    };
};

export default async function ReportsPage({ searchParams }: { searchParams: { range?: string, period?: string } }) {
    const supabase = createClient();
    if (!supabase) {
        return <div>Supabase not configured.</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // --- Fetch ALL transactions once ---
    const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('date, type, amount, categories(id, name)')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

    if (error) {
        console.error("Error fetching transactions for reports:", error);
        return <div>Error loading report data.</div>
    }
    const transactions = allTransactions || [];

    // --- 1. Net Worth Trend Calculations ---
    let cumulativeNetWorth = 0;
    const netWorthDataFull = transactions.map(t => {
        if (t.type === 'income') {
            cumulativeNetWorth += t.amount;
        } else if (t.type === 'expense') {
            cumulativeNetWorth -= t.amount;
        }
        return { date: t.date, netWorth: cumulativeNetWorth };
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
    
    // --- 2. & 3. Calculations for new reports ---
    const validPeriods = ['this_year', 'last_year'] as const;
    type Period = typeof validPeriods[number];
    const period: Period = validPeriods.includes(searchParams.period as any) ? searchParams.period as Period : 'this_year';
    
    const targetYear = period === 'last_year' ? today.getFullYear() - 1 : today.getFullYear();
    const yearRange = getYearDateRange(targetYear);

    const periodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toISOString() >= yearRange.start && tDate.toISOString() <= yearRange.end;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Income vs Expense Data
    const monthlyDataMap = new Map<string, { income: number; expense: number }>();
    monthNames.forEach(name => monthlyDataMap.set(name, { income: 0, expense: 0 }));

    periodTransactions.forEach(t => {
        const monthName = monthNames[new Date(t.date).getUTCMonth()];
        const data = monthlyDataMap.get(monthName);
        if (data) {
            if (t.type === 'income') data.income += t.amount;
            if (t.type === 'expense') data.expense += t.amount;
        }
    });
    const incomeExpenseData = Array.from(monthlyDataMap.entries()).map(([month, totals]) => ({ month, ...totals }));

    // Spending by Category Trend Data (for multi-line chart)
    const categoryMonthlySpending: { [month: string]: { [category: string]: number } } = {};
    monthNames.forEach(m => categoryMonthlySpending[m] = {});

    const allCategoryNames = new Set<string>();

    periodTransactions.forEach(t => {
        if (t.type === 'expense') {
            const monthName = monthNames[new Date(t.date).getUTCMonth()];
            const categoryName = t.categories?.name || 'Uncategorized';
            allCategoryNames.add(categoryName);
            if (categoryMonthlySpending[monthName]) {
                categoryMonthlySpending[monthName][categoryName] = (categoryMonthlySpending[monthName][categoryName] || 0) + t.amount;
            }
        }
    });

    const spendingByCategoryTrendData = monthNames.map(month => {
        const monthData: { [key: string]: string | number } = { month };
        allCategoryNames.forEach(catName => {
            monthData[catName] = categoryMonthlySpending[month][catName] || 0;
        });
        return monthData;
    });

    const categoryListForChart = Array.from(allCategoryNames);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <NetWorthReportChart data={netWorthDataFiltered} range={range} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IncomeVsExpenseReport data={incomeExpenseData} period={period} />
                <SpendingByCategoryReport 
                    data={spendingByCategoryTrendData} 
                    categories={categoryListForChart}
                    period={period} 
                />
            </div>
        </div>
    )
}
