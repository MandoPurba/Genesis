
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: { view?: string; error?: string } }) {
  const supabase = createClient()

  if (!supabase) {
    return <SupabaseConfigWarning />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/overview')
  }

  const isSignUpView = searchParams.view === 'signup';

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://cwiiattkbjfbntuqahzd.supabase.co/storage/v1/object/sign/assets/bacground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNzBjNzBhOS1mMTNiLTQwMTgtOGZkYS03Y2RjNTY2MzA2YzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvYmFjZ3JvdW5kLmpwZyIsImlhdCI6MTc1MTAxNTk1MiwiZXhwIjozMzI4NzAxNTk1Mn0.2pc4BJlJODQ71WVzqHW316EAlSRuXJ2vQv7RKhLCcpI')" }}
      />
      
      {/* Layout Grid */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-5">
        
        {/* Left Panel: Form (takes 2/5 of the width on md screens) */}
        <div className="col-span-1 md:col-span-2 flex items-center justify-center">
          <div className="h-full w-full flex flex-col items-center justify-center bg-transparent shadow-2xl backdrop-blur-sm">
            <div className="w-full max-w-sm p-6">
              <CardHeader className="text-center p-0 mb-6">
                <CardTitle className="text-3xl font-bold tracking-tight text-white">{isSignUpView ? 'Create Account' : 'Welcome Back'}</CardTitle>
                <CardDescription className="text-white/80">
                  {isSignUpView ? 'Enter your details to get started.' : 'Sign in to access your dashboard.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-0">
                 {searchParams.error && (
                  <Alert variant="destructive" className="bg-destructive/20 text-destructive-foreground border-destructive/50 [&>svg]:text-destructive-foreground">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{searchParams.error}</AlertDescription>
                  </Alert>
                )}

                {isSignUpView ? <SignupForm /> : <LoginForm />}
                
                <div className="mt-4 text-center text-sm">
                  {isSignUpView ? (
                    <>
                      <span className="text-white/80">Already have an account? </span>
                      <Link href="/login" className="underline text-white hover:text-white/80 font-semibold">
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-white/80">Don&apos;t have an account? </span>
                      <Link href="/login?view=signup" className="underline text-white hover:text-white/80 font-semibold">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          </div>
        </div>

        {/* Right Panel: Brand (takes 3/5 of the width on md screens) */}
        <div className="col-span-1 hidden md:col-span-3 md:flex md:flex-col md:items-end md:justify-end md:p-16">
          <div className="text-right">
             <div className="flex items-center justify-end gap-4">
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-primary flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M12 12a4 4 0 1 0-4-4" />
              </svg>
              <h1 className="text-6xl font-bold tracking-tight text-white">Genesis Pro</h1>
            </div>
            <p className="mt-2 text-xl text-white/80">Your Personal Finance Hub.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
