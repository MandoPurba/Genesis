
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeForm } from "./theme-form";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default async function SettingsPage() {
  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your application settings and preferences.</p>
        </header>

        {/* Appearance Section */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <h2 className="text-xl font-semibold">Appearance</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Customize the look and feel of your application.
                </p>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme</CardTitle>
                        <CardDescription>Select the color scheme for the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThemeForm />
                    </CardContent>
                </Card>
            </div>
        </section>

        <Separator />

        {/* General Section */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <h2 className="text-xl font-semibold">General</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Set your general application preferences.
                </p>
            </div>
            <div className="md:col-span-2">
                <Card>
                     <CardHeader>
                        <CardTitle>Currency</CardTitle>
                        <CardDescription>Set your preferred currency for the entire application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2 max-w-sm">
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
                    </CardContent>
                </Card>
            </div>
        </section>
    </div>
  )
}
