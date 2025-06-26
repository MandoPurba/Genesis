import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, BarChart, Scale } from "lucide-react"

export default function OverviewPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp 45,231,890</div>
            <p className="flex items-center text-xs text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp 12,750,300</div>
            <p className="flex items-center text-xs text-destructive">
              <TrendingDown className="w-4 h-4 mr-1" />
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Scale className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp 32,481,590</div>
            <p className="text-xs text-muted-foreground">Your current financial standing.</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Charts & Other Info */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
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
        <div className="flex flex-col col-span-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>Monthly spending vs budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mx-auto w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" className="stroke-current text-secondary" strokeWidth="4" fill="none" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" className="stroke-current text-primary" strokeWidth="4" fill="none" strokeDasharray="65, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">65%</span>
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
