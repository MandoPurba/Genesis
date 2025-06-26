import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, MessageCircle } from "lucide-react"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  if (!supabase) {
    return <SupabaseConfigWarning />
  }
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="floating" collapsible="icon">
        <SidebarHeader>
           <Link href="/overview" className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M4.93 19.07l-1.41 1.41"/><path d="M19.07 19.07l-1.41-1.41"/><path d="M4.93 4.93l-1.41-1.41"/><path d="M12 6V3"/><path d="M12 21v-3"/><path d="M18 12h3"/><path d="M3 12h3"/></svg>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* Header */}
        <header className="flex h-20 items-center gap-4 border-b bg-transparent px-4 md:px-6 sticky top-0 z-10">
          <SidebarTrigger className="md:hidden" />
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Hello, {userName}!</h1>
            <p className="text-sm text-muted-foreground">Explore information and activity about your finances</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-9 bg-card/80 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MessageCircle className="h-5 w-5" />
                    <span className="sr-only">Messages</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
