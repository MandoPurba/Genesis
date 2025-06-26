import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SupabaseConfigWarning } from "@/components/supabase-config-warning"

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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background/80 dark:bg-background/60 backdrop-blur-xl md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="240" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="16" y1="128" x2="48" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M80,216H48a16,16,0,0,1-16-16V56A16,16,0,0,1,48,40H80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M176,40h32a16,16,0,0,1,16,16V200a16,16,0,0,1-16,16H176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M80,88h96a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path></svg>
              <span className="">Genesis Pro</span>
            </a>
          </div>
          <div className="flex-1">
            <MainNav className="grid items-start px-2 text-sm font-medium lg:px-4" />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/80 dark:bg-background/60 backdrop-blur-xl px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-background/80 dark:bg-background/60 backdrop-blur-xl">
              <MainNav />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search bar here later */}
          </div>
          <ThemeToggle />
          <UserNav user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}
