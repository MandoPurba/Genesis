
"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signup, loginWithGoogle } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, LoaderCircle } from "lucide-react"

function EmailSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" className="w-full bg-black/20 text-white border border-white/30 hover:bg-black/30" aria-disabled={pending}>
      {pending ? "Creating account..." : "Sign Up with Email"}
    </Button>
  )
}

function GoogleSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="outline" type="submit" className="w-full bg-black/20 text-white border border-white/30 hover:bg-black/30" disabled={pending}>
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
                <span className="w-full border-t border-white/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/80">
                    Or continue with
                </span>
            </div>
        </div>

        <form action={formAction} className="space-y-4">
            <Input
              id="email-signup"
              name="email"
              type="email"
              placeholder="Email"
              required
              className="bg-black/20 border-white/30 text-white placeholder:text-white/70 focus:bg-black/30 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Input 
              id="password-signup" 
              name="password" 
              type="password" 
              placeholder="Password"
              required 
              className="bg-black/20 border-white/30 text-white placeholder:text-white/70 focus:bg-black/30 focus-visible:ring-0 focus-visible:ring-offset-0" 
            />
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
