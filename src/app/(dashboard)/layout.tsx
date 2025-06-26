import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, MessageCircle } from "lucide-react"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"
import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
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
        <div className="flex h-screen w-full flex-col gap-6 bg-background p-8">
            <header className="flex h-20 shrink-0 items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl">Hello, {userName}!</h1>
                        <p className="text-sm text-muted-foreground">Explore information and activity about your finances</p>
                    </div>
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
            
            <div className="flex flex-1 gap-8 overflow-hidden">
              <Sidebar side="left" variant="floating" collapsible="icon">
                <SidebarContent>
                  <MainNav />
                </SidebarContent>
                <SidebarFooter>
                  <UserNav user={user} />
                </SidebarFooter>
              </Sidebar>

              <main className="flex-1 overflow-hidden">
                {children}
              </main>
          </div>
        </div>
      </SidebarProvider>
  )
}
