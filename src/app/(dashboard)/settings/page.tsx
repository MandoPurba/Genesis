
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeForm } from "./theme-form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your application settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <ThemeForm />

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">General</h3>
                    <div className="space-y-2 max-w-sm">
                        <Label htmlFor="currency">Currency</Label>
                        <p className="text-sm text-muted-foreground">
                            Set your preferred currency for the entire application.
                        </p>
                         <Select name="currency" defaultValue="IDR" disabled>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                                <SelectItem value="USD" disabled>USD - US Dollar (Coming soon)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground pt-1">
                            Currency switching is not yet available.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
