import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const glassCard = "bg-card/70 dark:bg-card/50 backdrop-blur-lg";

export default function TransactionsPage() {
  return (
    <Card className={glassCard}>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Manage your transactions here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Transaction management interface will be here.</p>
      </CardContent>
    </Card>
  )
}
