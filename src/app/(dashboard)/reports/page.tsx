
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
        return { date: new Date(t.date), netWorth: cumulativeNetWorth };
    });

    // Get a single point for the end of each month
    const monthlyNetWorthMap = new Map<string, { date: Date, netWorth: number }>();
    if(netWorthDataFull.length > 0) {
        netWorthDataFull.forEach(point => {
            const monthKey = `${point.date.getUTCFullYear()}-${String(point.date.getUTCMonth() + 1).padStart(2, '0')}`;
            monthlyNetWorthMap.set(monthKey, point); // Overwrites until we have the last value for each month
        });
    }
    const monthlyPoints = Array.from(monthlyNetWorthMap.values()).sort((a,b) => a.date.getTime() - b.date.getTime());
    
    // Initialize data structure for the chart with trend properties
    const monthlyPointsWithTrend = monthlyPoints.map(point => ({
        date: point.date,
        netWorth: point.netWorth,
        up: null as number | null,
        down: null as number | null,
        stable: null as number | null,
    }));

    // Calculate trend colors across the entire dataset
    if (monthlyPointsWithTrend.length > 1) {
        for (let i = 1; i < monthlyPointsWithTrend.length; i++) {
            const prev = monthlyPointsWithTrend[i-1];
            const current = monthlyPointsWithTrend[i];

            // Set values on both prev and current to create continuous colored segments
            if (current.netWorth > prev.netWorth) {
                prev.up = prev.netWorth;
                current.up = current.netWorth;
            } else if (current.netWorth < prev.netWorth) {
                prev.down = prev.netWorth;
                current.down = current.netWorth;
            } else { // Stable
                // Set values on both points for a continuous segment
                prev.stable = prev.netWorth;
                current.stable = current.netWorth;
            }
        }
    } else if (monthlyPointsWithTrend.length === 1) {
        // A single point is considered stable
        monthlyPointsWithTrend[0].stable = monthlyPointsWithTrend[0].netWorth;
    }

    const validRanges = ['1y', '5y', 'all'] as const;
    type Range = typeof validRanges[number];
    const range: Range = validRanges.includes(searchParams.range as any) ? searchParams.range as Range : '5y';
    
    // Filter the trend-calculated data based on the selected range
    const today = new Date();
    let filteredMonthlyPoints = monthlyPointsWithTrend;
    if (range === '1y') {
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const anchorPoint = monthlyPointsWithTrend.findLast(p => p.date < oneYearAgo);
        const pointsInWindow = monthlyPointsWithTrend.filter(d => d.date >= oneYearAgo);
        filteredMonthlyPoints = anchorPoint ? [anchorPoint, ...pointsInWindow] : pointsInWindow;
    } else if (range === '5y') {
        const fiveYearsAgo = new Date(today);
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);
        const anchorPoint = monthlyPointsWithTrend.findLast(p => p.date < fiveYearsAgo);
        const pointsInWindow = monthlyPointsWithTrend.filter(d => d.date >= fiveYearsAgo);
        filteredMonthlyPoints = anchorPoint ? [anchorPoint, ...pointsInWindow] : pointsInWindow;
    }
    
    const netWorthDataForChart = filteredMonthlyPoints.map(point => ({
        date: point.date.toISOString(),
        netWorth: point.netWorth,
        up: point.up,
        down: point.down,
        stable: point.stable,
    }));
    
    // --- 2. & 3. Calculations for other reports ---
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

    // Spending by Category Trend Data
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
                <NetWorthReportChart data={netWorthDataForChart} range={range} period={period} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IncomeVsExpenseReport data={incomeExpenseData} period={period} range={range} />
                <SpendingByCategoryReport 
                    data={spendingByCategoryTrendData} 
                    categories={categoryListForChart}
                    period={period} 
                />
            </div>
        </div>
    )
}
