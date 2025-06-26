import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, BarChart, Banknote, Users, Fingerprint, PlusCircle } from "lucide-react"
import Image from "next/image"

export default function OverviewPage() {
  return (
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Stat Cards */}
      <Card>
        <CardHeader>
          <CardDescription>Spent this month</CardDescription>
          <CardTitle className="flex items-baseline gap-2">
            <span>$682.5</span>
            <BarChart className="h-8 w-8 text-muted-foreground"/>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>New transactions</CardDescription>
          <CardTitle className="flex items-baseline gap-2">
            <span>321</span>
            <Users className="h-8 w-8 text-muted-foreground"/>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Earnings</CardDescription>
          <CardTitle className="flex items-baseline gap-2">
            <span>$350.40</span>
            <Banknote className="h-8 w-8 text-muted-foreground"/>
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardDescription className="text-primary-foreground/80">Activity</CardDescription>
          <CardTitle className="flex items-baseline gap-2">
            <span>$540.50</span>
             <div className="w-16 h-8 flex items-center">
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0,30 Q10,10 20,30 T40,25 T60,35 T80,20 T100,22" stroke="white" fill="none" strokeWidth="2"/>
                </svg>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Grid Area */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Balance</CardTitle>
          <CardDescription className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"/> On track</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
              <div className="font-semibold">
                  <p className="text-xs text-muted-foreground">Saves</p>
                  <p className="flex items-center gap-1">43.50% <span className="text-success flex items-center text-xs"><ArrowUp className="h-3 w-3"/>+2.45%</span></p>
              </div>
               <div className="font-semibold text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="flex items-center gap-1">$52,422 <span className="text-destructive flex items-center text-xs"><ArrowDown className="h-3 w-3"/>-4.75%</span></p>
              </div>
          </div>
          <div data-ai-hint="line chart" className="h-[200px] w-full rounded-md flex items-end p-2">
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path d="M0,80 C30,20 70,90 100,60 S160,0 200,50 S250,100 300,70" stroke="hsl(var(--primary))" fill="none" strokeWidth="2"/>
            </svg>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
              <CardTitle>Earnings</CardTitle>
              <CardDescription>Total Expense</CardDescription>
              <p className="text-2xl font-bold pt-2">$6078.76</p>
              <p className="text-xs text-muted-foreground">Profit is 34% More than last Month</p>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
              <div className="relative h-32 w-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                      <path d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          className="stroke-current text-secondary"
                          strokeWidth="3" fill="none" />
                      <path d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831"
                          className="stroke-current text-primary"
                          strokeWidth="3" fill="none"
                          strokeDasharray="80, 100"
                          strokeLinecap="round"
                      />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">80%</span>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <Card className="md:col-span-1 lg:col-span-1 row-start-3 md:row-start-auto">
          <CardHeader>
              <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
              <Image src="https://placehold.co/100x100.png" data-ai-hint="person avatar" alt="User Avatar" width={80} height={80} className="rounded-full mx-auto" />
              <p className="font-semibold mt-4">Carlic Bolomboy</p>
              <p className="text-sm text-muted-foreground">carlic@gmai.com</p>
              <div className="flex justify-around mt-4 text-sm">
                  <div>
                      <p className="font-bold">26</p>
                      <p className="text-muted-foreground">Projects</p>
                  </div>
                   <div>
                      <p className="font-bold">356</p>
                      <p className="text-muted-foreground">Followers</p>
                  </div>
                   <div>
                      <p className="font-bold">68</p>
                      <p className="text-muted-foreground">Following</p>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Available Credit Card in Wallet</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Card
              </Button>
            </div>
            <div className="relative h-[188px] w-[300px] group">
                <Image src="https://placehold.co/300x188.png" data-ai-hint="credit card" alt="Credit Card 1" layout="fill" className="rounded-xl object-cover transform -rotate-6 transition-transform group-hover:rotate-0" />
                <Image src="https://placehold.co/300x188.png" data-ai-hint="credit card" alt="Credit Card 2" layout="fill" className="rounded-xl object-cover transform rotate-6 top-4 transition-transform group-hover:rotate-0" />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Your Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                        <ArrowUp className="h-4 w-4 text-success" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">From Anna Jones</p>
                        <p className="text-xs text-muted-foreground">Today, 14:34</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-success">+2.45%</p>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                        <ArrowDown className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">To Carlos Brown III</p>
                        <p className="text-xs text-muted-foreground">Today, 15:23</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-destructive">-4.75%</p>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                     <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                        <ArrowUp className="h-4 w-4 text-success" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">From Joel Cannan</p>
                        <p className="text-xs text-muted-foreground">Today, 17:54</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-success">+2.45%</p>
            </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader className="text-center">
              <Fingerprint className="h-10 w-10 mx-auto text-primary"/>
          </CardHeader>
          <CardContent className="text-center">
              <p className="font-bold">Keep you safe!</p>
              <p className="text-sm text-muted-foreground mb-4">Update your security password</p>
              <Button>Update Your Security</Button>
          </CardContent>
      </Card>
    </div>
  )
}
