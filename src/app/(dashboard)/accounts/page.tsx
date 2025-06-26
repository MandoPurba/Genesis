import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const glassCard = "bg-card/70 dark:bg-card/50 backdrop-blur-lg";

export default function AccountsPage() {
  return (
    <Card className={glassCard}>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Manage your accounts here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Account management interface will be here.</p>
      </CardContent>
    </Card>
  )
}
