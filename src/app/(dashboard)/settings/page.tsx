
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeForm } from "./theme-form";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Integrations</h3>
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
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
