
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

export default async function ReportsPage({ searchParams }: { searchParams: { range?: string, period?: string, spendingPeriod?: string } }) {
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
    const today = new Date();

    // --- 1. Monthly Net Cash Flow Calculations ---
    const monthlyFlowMap = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
        const monthKey = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
        const monthData = monthlyFlowMap.get(monthKey) || { income: 0, expense: 0 };
        if (t.type === 'income') {
            monthData.income += t.amount;
        } else if (t.type === 'expense') {
            monthData.expense += t.amount;
        }
        monthlyFlowMap.set(monthKey, monthData);
    });

    const monthlyFlows = Array.from(monthlyFlowMap.entries()).map(([monthKey, data]) => {
        return {
            date: new Date(`${monthKey}-01T00:00:00Z`), // Use first day of month for sorting
            netFlow: data.income - data.expense,
        };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());

    const validRanges = ['1y', '5y', 'all'] as const;
    type Range = typeof validRanges[number];
    const range: Range = validRanges.includes(searchParams.range as any) ? searchParams.range as Range : '5y';
    
    let filteredMonthlyFlows = monthlyFlows;
    if (range === '1y') {
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        filteredMonthlyFlows = monthlyFlows.filter(d => d.date >= oneYearAgo);
    } else if (range === '5y') {
        const fiveYearsAgo = new Date(today);
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);
        filteredMonthlyFlows = monthlyFlows.filter(d => d.date >= fiveYearsAgo);
    }
    
    const cashFlowDataForChart = filteredMonthlyFlows.map(point => ({
        date: point.date.toISOString(),
        netFlow: point.netFlow,
    }));
    
    // --- 2. & 3. Calculations for other reports ---
    const validPeriods = ['this_year', 'last_year'] as const;
    type Period = typeof validPeriods[number];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Data for Income vs Expense Report
    const period: Period = validPeriods.includes(searchParams.period as any) ? searchParams.period as Period : 'this_year';
    const targetYear = period === 'last_year' ? today.getFullYear() - 1 : today.getFullYear();
    const yearRange = getYearDateRange(targetYear);

    const periodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toISOString() >= yearRange.start && tDate.toISOString() <= yearRange.end;
    });

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

    // Data for Spending by Category Trend Report
    const spendingPeriod: Period = validPeriods.includes(searchParams.spendingPeriod as any) ? searchParams.spendingPeriod as Period : 'this_year';
    const targetSpendingYear = spendingPeriod === 'last_year' ? today.getFullYear() - 1 : today.getFullYear();
    const spendingYearRange = getYearDateRange(targetSpendingYear);

    const spendingPeriodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toISOString() >= spendingYearRange.start && tDate.toISOString() <= spendingYearRange.end;
    });
    
    const categoryMonthlySpending: { [month: string]: { [category: string]: number } } = {};
    monthNames.forEach(m => categoryMonthlySpending[m] = {});

    const allCategoryNames = new Set<string>();
    spendingPeriodTransactions.forEach(t => {
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
                <NetWorthReportChart data={cashFlowDataForChart} range={range} period={period} spendingPeriod={spendingPeriod} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IncomeVsExpenseReport data={incomeExpenseData} period={period} range={range} spendingPeriod={spendingPeriod} />
                <SpendingByCategoryReport 
                    data={spendingByCategoryTrendData} 
                    categories={categoryListForChart}
                    spendingPeriod={spendingPeriod}
                    period={period}
                    range={range}
                />
            </div>
        </div>
    )
}
