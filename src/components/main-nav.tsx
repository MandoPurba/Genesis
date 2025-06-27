"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  ArrowRightLeft,
  Target,
  Landmark,
  LayoutList,
  PieChart,
} from "lucide-react"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar"

const links = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/categories", label: "Categories", icon: LayoutList },
  { href: "/reports", label: "Reports", icon: PieChart },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href)
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={link.label}>
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
