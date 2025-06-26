import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, BarChart } from "lucide-react"

export default function OverviewPage() {
  return (
    <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Main Content */}
      <div className="flex flex-col col-span-1 gap-8 lg:col-span-2">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
        </div>

        {/* Chart */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>A visual representation of your cash flow.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            <div data-ai-hint="bar chart" className="flex items-center justify-center w-full h-64 rounded-lg bg-muted/50">
              <BarChart className="w-16 h-16 text-muted-foreground/50"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Content */}
      <div className="flex flex-col col-span-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Rp 32,481,590</div>
            <p className="mt-1 text-xs text-muted-foreground">Your current financial standing.</p>
          </CardContent>
        </Card>
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
         <Card className="flex-1">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
             <div data-ai-hint="pie chart" className="flex items-center justify-center w-full h-40 rounded-lg bg-muted/50">
               <Activity className="w-16 h-16 text-muted-foreground/50"/>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
