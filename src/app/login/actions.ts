"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/overview")
}

export async function signup(prevState: any, formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
        return { error: "This email is already registered. Please try logging in." };
    }
    return { error: error.message }
  }

  return { message: "Check your email to continue the sign-up process." }
}


export async function loginWithGoogle() {
  const origin = headers().get("origin")
  const supabase = createClient()

  if (!supabase) {
    return redirect('/login?error=Supabase client not available.')
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google login error:', error)
    return redirect('/login?error=Could not authenticate with Google.')
  }

  return redirect(data.url)
}
