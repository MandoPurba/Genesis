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
    <div className="relative min-h-screen w-full bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }}
        data-ai-hint="dark abstract"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-4 md:items-start md:p-8 lg:p-16">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-primary flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M12 12a4 4 0 1 0-4-4" />
              </svg>
              <h1 className="text-4xl font-bold tracking-tight text-white">Genesis Pro</h1>
            </div>
            <Card className="bg-gray-900/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">{isSignUpView ? 'Create an account' : 'Welcome back!'}</CardTitle>
                <CardDescription className="text-gray-300">
                  {isSignUpView ? 'Enter your details to get started.' : 'Sign in to access your dashboard.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                 {searchParams.error && (
                  <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{searchParams.error}</AlertDescription>
                  </Alert>
                )}

                {isSignUpView ? <SignupForm /> : <LoginForm />}
                
                <div className="mt-4 text-center text-sm">
                  {isSignUpView ? (
                    <>
                      <span className="text-gray-300">Already have an account? </span>
                      <Link href="/login" className="underline text-primary-foreground hover:text-white font-semibold">
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-300">Don&apos;t have an account? </span>
                      <Link href="/login?view=signup" className="underline text-primary-foreground hover:text-white font-semibold">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="hidden md:block">
          {/* This is the empty right side, it will just show the background */}
        </div>
      </div>
    </div>
  )
}
