"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signup, loginWithGoogle } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, LoaderCircle } from "lucide-react"

function EmailSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? "Creating account..." : "Sign Up with Email"}
    </Button>
  )
}

function GoogleSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="outline" type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20" disabled={pending}>
            {pending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.7 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-58.3 52.7C338.6 97.2 297.9 80 248 80c-82.8 0-150.5 67.7-150.5 150.5S165.2 431 248 431c92.8 0 140.3-61.5 143.8-92.6H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
            )}
            Sign up with Google
        </Button>
    )
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, null)

  return (
     <div className="grid gap-6">
        <form action={loginWithGoogle}>
            <GoogleSubmitButton />
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900/40 px-2 text-gray-300">
                    Or continue with
                </span>
            </div>
        </div>

        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-gray-300">Email</Label>
                <Input
                id="email-signup"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-white/5 border-white/20 placeholder:text-gray-400 text-white"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-gray-300">Password</Label>
                <Input id="password-signup" name="password" type="password" required className="bg-white/5 border-white/20 placeholder:text-gray-400 text-white"/>
            </div>
            {state?.error && (
                <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
            {state?.message && (
                <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
            <EmailSubmitButton />
        </form>
    </div>
  )
}
