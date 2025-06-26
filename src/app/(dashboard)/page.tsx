import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRootPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Welcome to Genesis Pro!</CardTitle>
        </CardHeader>
        <CardContent>
            <h1 className="text-4xl font-bold">Hello, World!</h1>
            <p className="text-muted-foreground mt-2">This is the beginning of your personal budgeting dashboard.</p>
        </CardContent>
    </Card>
  )
}
