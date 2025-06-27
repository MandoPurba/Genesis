

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"
import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { MobileBlocker } from "@/components/mobile-blocker"
import { GlobalSearch } from "@/components/global-search"
import { NotificationDropdown } from "@/components/notification-dropdown"

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
          <div className="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
              <header className="flex items-center justify-between gap-4 p-4 pb-0">
                  <div className="flex items-center gap-4">
                      <SidebarTrigger className="md:hidden" />
                      <div className="flex items-center gap-4 pl-4 md:pl-0">
                          <svg
                              role="img"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-primary flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                              <path d="M12 12a4 4 0 1 0-4-4" />
                          </svg>
                          <div>
                              <h1 className="text-lg font-semibold md:text-2xl">Hello, {userName}!</h1>
                              <p className="text-sm text-muted-foreground">Welcome to your financial dashboard.</p>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="relative hidden md:block w-64">
                        <GlobalSearch />
                      </div>
                      <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <Button variant="ghost" size="icon" className="rounded-full">
                              <MessageCircle className="h-5 w-5" />
                              <span className="sr-only">Messages</span>
                          </Button>
                          <NotificationDropdown />
                      </div>
                  </div>
              </header>

              <div className="grid grid-cols-[auto_1fr] gap-4 p-4 pt-6 overflow-y-hidden">
                <Sidebar side="left" variant="floating" collapsible="icon" className="z-40">
                  <SidebarContent className="pt-2">
                    <MainNav />
                  </SidebarContent>
                  <SidebarFooter className="pb-2">
                    <UserNav user={userForNav} />
                  </SidebarFooter>
                </Sidebar>

                <main className="overflow-y-auto">
                  {children}
                </main>
            </div>
          </div>
        </SidebarProvider>
      </MobileBlocker>
  )
}

    
