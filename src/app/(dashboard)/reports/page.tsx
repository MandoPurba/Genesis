import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Reports & Analysis</CardTitle>
            <CardDescription>Get detailed insights into your financial habits.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-10">
            <Construction className="w-16 h-16 text-muted-foreground/50"/>
            <h3 className="text-lg font-semibold mt-4">Feature Under Construction</h3>
            <p className="text-muted-foreground">This page is currently being developed. Check back soon!</p>
        </CardContent>
    </Card>
  )
}
