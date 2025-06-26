import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRootPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Welcome to Genesis Pro!</CardTitle>
        </CardHeader>
        <CardContent>
            <h1 className="text-4xl font-bold">Your Personal Finance Hub</h1>
            <p className="mt-2 text-muted-foreground">Navigate using the sidebar to manage your finances.</p>
        </CardContent>
    </Card>
  )
}
