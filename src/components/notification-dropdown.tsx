
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Gift, ShoppingCart, Wallet } from "lucide-react"

const notifications = [
  {
    id: "1",
    icon: <ShoppingCart className="h-5 w-5 text-primary" />,
    title: "New Expense Added",
    description: "You spent Rp 75.000 on Groceries.",
    time: "15m ago",
  },
  {
    id: "2",
    icon: <Wallet className="h-5 w-5 text-success" />,
    title: "Income Received!",
    description: "Monthly salary of Rp 5.000.000 received.",
    time: "1h ago",
  },
  {
    id: "3",
    icon: <Gift className="h-5 w-5 text-destructive" />,
    title: "Budget Alert",
    description: "You are approaching your 'Shopping' budget limit.",
    time: "3h ago",
  },
]

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3">
            <div className="flex-shrink-0">{notification.icon}</div>
            <div className="flex-grow">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground">{notification.description}</p>
            </div>
            <div className="flex-shrink-0 text-xs text-muted-foreground">{notification.time}</div>
          </DropdownMenuItem>
        ))}
         <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-sm font-medium text-primary hover:!bg-accent cursor-pointer">
            View all notifications
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
