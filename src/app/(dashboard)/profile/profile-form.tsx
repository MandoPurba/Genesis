"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Profile = {
    full_name: string | null;
    avatar_url: string | null;
} | null;


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
        </Button>
    );
}

export function ProfileForm({ profile }: { profile: Profile }) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(updateProfile, null);

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.success });
            router.refresh(); // Refresh to ensure layout gets updated data
        } else if (state?.error) {
            toast({ title: "Error", description: state.error, variant: "destructive" });
        }
    }, [state, toast, router]);

    return (
        <form action={formAction} className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    defaultValue={profile?.full_name || ""}
                    required
                />
                {state?.errors?.fullName && <p className="text-destructive text-sm mt-1">{state.errors.fullName[0]}</p>}
            </div>
            {/* Avatar upload could be added here in the future */}
            <SubmitButton />
        </form>
    );
}
