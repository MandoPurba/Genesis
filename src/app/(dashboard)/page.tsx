import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardRootPage() {
  return (
    <Card className="bg-card/70 dark:bg-card/50 backdrop-blur-lg">
        <CardHeader>
            <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
            <h1 className="text-4xl font-bold">Hello, World!</h1>
            <p className="text-muted-foreground mt-2">This is the beginning of your Project Genesis dashboard.</p>
        </CardContent>
    </Card>
  )
}
