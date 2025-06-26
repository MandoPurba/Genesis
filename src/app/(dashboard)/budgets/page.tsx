import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const glassCard = "bg-card/70 dark:bg-card/50 backdrop-blur-lg";

export default function BudgetsPage() {
  return (
    <Card className={glassCard}>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
        <CardDescription>Manage your budgets here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Budget management interface will be here.</p>
      </CardContent>
    </Card>
  )
}
