
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeForm } from "./theme-form";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/server";
import { GoogleAnalyticsForm } from "./google-analytics-form";


export default async function SettingsPage() {
  const supabase = createClient();
  let gaMeasurementId: string | null = null;
  let gaError = false;

  const createSettingsTableSql = `CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;


  if (supabase) {
      const { data: gaSetting, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ga_measurement_id')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error("Error fetching GA setting:", error);
        if (error.code === '42P01') { // relation "settings" does not exist
          gaError = true;
        }
      }
      if (gaSetting) {
        gaMeasurementId = gaSetting.value;
      }
  }

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

        <Separator />

        {/* Integrations Section */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <h2 className="text-xl font-semibold">Integrations</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Connect with third-party services.
                </p>
            </div>
            <div className="md:col-span-2">
                <Card>
                     <CardHeader>
                        <CardTitle>Google Analytics</CardTitle>
                        <CardDescription>Enter your GA4 Measurement ID to enable analytics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gaError ? (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                                <h4 className="font-bold">Database Table Missing</h4>
                                <p className="text-sm">
                                    The Google Analytics integration requires a `settings` table in your database. Please run the following SQL command in your Supabase SQL Editor.
                                </p>
                                <pre className="mt-4 p-2 bg-muted/50 text-xs rounded-md overflow-x-auto text-current">
                                    {createSettingsTableSql}
                                </pre>
                            </div>
                        ) : (
                            <GoogleAnalyticsForm measurementId={gaMeasurementId} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    </div>
  )
}
