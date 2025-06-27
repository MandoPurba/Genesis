
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
    const supabase = createClient();
    if (!supabase) {
        return <div>Supabase client not available.</div>;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information. Changes will be reflected across the app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm profile={profile} />
                </CardContent>
            </Card>
        </div>
    );
}
