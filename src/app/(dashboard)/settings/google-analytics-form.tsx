"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { updateGoogleAnalyticsId } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
        </Button>
    );
}

export function GoogleAnalyticsForm({ measurementId }: { measurementId: string | null }) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateGoogleAnalyticsId, null);

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success!", description: state.success });
        } else if (state?.error) {
            toast({ title: "Error", description: state.error, variant: "destructive" });
        }
    }, [state, toast]);

    return (
        <form action={formAction} className="space-y-4 max-w-sm">
            <div className="space-y-2">
                <Label htmlFor="measurementId">Measurement ID</Label>
                 <p className="text-sm text-muted-foreground">
                    Enter your Google Analytics 4 (GA4) Measurement ID (e.g., G-XXXXXXXXXX).
                </p>
                <Input
                    id="measurementId"
                    name="measurementId"
                    type="text"
                    placeholder="G-..."
                    defaultValue={measurementId || ""}
                />
                {state?.errors?.measurementId && <p className="text-destructive text-sm mt-1">{state.errors.measurementId[0]}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}
