
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
import { MobileBlocker } from "@/components/mobile-blocker"

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';

  const userForNav = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
      }
    }


  return (
      <MobileBlocker>
        <SidebarProvider>
          <div className="flex h-screen w-full flex-col bg-background">
              <div className="flex flex-1 gap-8 overflow-hidden p-8">
                <Sidebar side="left" variant="floating" collapsible="icon" className="z-40">
                  <SidebarContent className="pt-6">
                    <MainNav />
                  </SidebarContent>
                  <SidebarFooter className="pb-6">
                    <UserNav user={userForNav} />
                  </SidebarFooter>
                </Sidebar>

                <main className="flex flex-1 flex-col overflow-y-auto">
                    <header className="flex h-20 shrink-0 items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="md:hidden" />
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-lg font-semibold md:text-2xl">Hello, {userName}!</h1>
                                <p className="text-sm text-muted-foreground">Welcome to your financial dashboard.</p>
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
                    <div className="flex-1">
                      {children}
                    </div>
                </main>
            </div>
          </div>
        </SidebarProvider>
      </MobileBlocker>
  )
}
