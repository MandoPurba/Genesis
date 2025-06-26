"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  ArrowRightLeft,
  Target,
  Landmark,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const links = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/accounts", label: "Accounts", icon: Landmark },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Tooltip key={link.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10",
                    isActive && "bg-primary text-primary-foreground hover:text-primary-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card text-card-foreground">
                <p>{link.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
