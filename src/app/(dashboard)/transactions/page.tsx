import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-lg">
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
