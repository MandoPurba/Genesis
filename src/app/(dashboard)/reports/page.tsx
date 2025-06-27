import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NetWorthReportChart } from "@/components/net-worth-report-chart"

export default async function ReportsPage({ searchParams }: { searchParams: { range?: string } }) {
    const supabase = createClient();
    if (!supabase) {
        return <div>Supabase not configured.</div>;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // --- Fetch ALL transactions for the Net Worth report ---
    const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('date, type, amount')
        .eq('user_id', user.id)
        .order('date', { ascending: true }) // Order chronologically for net worth calculation

    if (error) {
        console.error("Error fetching transactions for reports:", error);
        return <div>Error loading report data.</div>
    }

    const transactions = allTransactions || [];

    // --- Net Worth Trend Calculations ---
    let cumulativeNetWorth = 0;
    const netWorthDataFull = transactions.map(t => {
        if (t.type === 'income') {
            cumulativeNetWorth += t.amount;
        } else if (t.type === 'expense') {
            cumulativeNetWorth -= t.amount;
        }
        // Transfers do not affect net worth
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
             <div className="grid grid-cols-1 gap-4">
                <NetWorthReportChart data={netWorthDataFiltered} range={range} />
            </div>
        </div>
    )
}
