
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

    // --- 1. Net Worth Trend Calculations ---
    const monthlyNetWorthMap = new Map<string, number>();
    let currentNetWorth = 0;
    
    if (transactions.length > 0) {
        let lastMonthKey = new Date(transactions[0].date).toISOString().slice(0, 7);

        transactions.forEach(t => {
            const monthKey = new Date(t.date).toISOString().slice(0, 7);
            
            // Fill in any gaps for months with no transactions
            if (monthKey !== lastMonthKey) {
                let tempDate = new Date(`${lastMonthKey}-02T00:00:00Z`); // Use day 2 to avoid timezone issues
                tempDate.setUTCMonth(tempDate.getUTCMonth() + 1);
                while(tempDate.toISOString().slice(0,7) < monthKey) {
                    monthlyNetWorthMap.set(tempDate.toISOString().slice(0,7), currentNetWorth);
                    tempDate.setUTCMonth(tempDate.getUTCMonth() + 1);
                }
            }
            
            if (t.type === 'income') {
                currentNetWorth += t.amount;
            } else if (t.type === 'expense') {
                currentNetWorth -= t.amount;
            }
            // Transfers between own accounts don't affect net worth
            
            monthlyNetWorthMap.set(monthKey, currentNetWorth);
            lastMonthKey = monthKey;
        });
    }

    const netWorthData = Array.from(monthlyNetWorthMap.entries()).map(([monthKey, data]) => {
        return {
            date: new Date(`${monthKey}-01T12:00:00Z`).toISOString(), // Use a consistent time for sorting
            netWorth: data,
        };
    }).sort((a, b) => new Date(a.date).getTime() - b.date.getTime());

    const validRanges = ['1y', '5y', 'all'] as const;
    type Range = typeof validRanges[number];
    const range: Range = validRanges.includes(searchParams.range as any) ? searchParams.range as Range : '1y';
    
    let filteredNetWorthData = netWorthData;
    if (range !== 'all' && netWorthData.length > 0) {
        const rangeStart = new Date();
        if (range === '1y') {
            rangeStart.setFullYear(today.getFullYear() - 1);
        } else if (range === '5y') {
            rangeStart.setFullYear(today.getFullYear() - 5);
        }
        
        const anchorIndex = netWorthData.findIndex(d => new Date(d.date) >= rangeStart);
        const startIndex = anchorIndex > 0 ? anchorIndex - 1 : anchorIndex;
        
        if (startIndex !== -1) {
            filteredNetWorthData = netWorthData.slice(startIndex);
        } else {
            filteredNetWorthData = netWorthData.length > 0 ? [netWorthData[netWorthData.length - 1]] : [];
        }
    }
    
    // --- 2. & 3. Calculations for other reports ---
    const validPeriods = ['this_year', 'last_year'] as const;
    type Period = typeof validPeriods[number];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Data for Income vs Expense Report
    const periodParam = searchParams.period as any;
    const period: Period = validPeriods.includes(periodParam) ? periodParam : 'this_year';
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
    const spendingPeriodParam = searchParams.spendingPeriod as any;
    const spendingPeriod: Period = validPeriods.includes(spendingPeriodParam) ? spendingPeriodParam : 'this_year';
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
                <NetWorthReportChart data={filteredNetWorthData} range={range} period={period} spendingPeriod={spendingPeriod} />
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
