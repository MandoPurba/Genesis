"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  ArrowRightLeft,
  Target,
  Landmark,
  FileSearch,
  LoaderCircle,
  LayoutList,
  PieChart,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, IconForCategory } from "@/lib/utils"
import { usePrivacy } from "@/contexts/privacy-context"

type Transaction = {
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  categories: { name: string } | null;
}

const navLinks = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/categories", label: "Categories", icon: LayoutList },
  { href: "/reports", label: "Reports", icon: PieChart },
]

export function GlobalSearch() {
  const router = useRouter()
  const { isPrivacyMode } = usePrivacy()
  const [open, setOpen] = React.useState(false)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (open && transactions.length === 0) {
      const fetchTransactions = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('transactions')
            .select('id, date, type, amount, description, categories(name)')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(500)
          
          if (data) {
            setTransactions(data as Transaction[])
          }
          if (error) {
            console.error("Error fetching transactions for global search:", error)
          }
        }
        setLoading(false)
      }
      fetchTransactions()
    }
  }, [open, transactions.length])

  const handleSelect = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  const getCommandValue = (t: Transaction) => {
    return [t.description, t.categories?.name, t.amount.toString(), t.type]
      .filter(Boolean)
      .join(" ")
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start rounded-full bg-card/80 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
          {!loading && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          <CommandGroup heading="Navigation">
            {navLinks.map((link) => (
              <CommandItem
                key={link.href}
                value={`page ${link.label}`}
                onSelect={() => handleSelect(() => router.push(link.href))}
              >
                <link.icon className="mr-2 h-4 w-4" />
                <span>{link.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          {transactions.length > 0 && <CommandSeparator />}
          {transactions.length > 0 && (
            <CommandGroup heading="Transactions">
              {transactions.map((transaction) => (
                <CommandItem
                  key={transaction.id}
                  value={getCommandValue(transaction)}
                  onSelect={() => handleSelect(() => router.push('/transactions'))}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconForCategory categoryName={transaction.categories?.name || 'Uncategorized'} className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.description || transaction.categories?.name || 'Transaction'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                           {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className={`font-mono text-sm ${transaction.type === 'income' ? 'text-success' : ''}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, isPrivacyMode)}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
