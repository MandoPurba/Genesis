import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupabaseConfigWarning } from '@/components/supabase-config-warning'

export default async function Home() {
  const supabase = createClient()

  if (!supabase) {
    return <SupabaseConfigWarning />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard/overview')
  } else {
    redirect('/login')
  }
}
