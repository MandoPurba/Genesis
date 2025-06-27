"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { fetchTransactions } from "@/app/(dashboard)/transactions/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, IconForCategory } from "@/lib/utils"
import { LoaderCircle, FileSearch } from "lucide-react"

type Transaction = {
  id: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string | null;
  categories: {
      id: string;
      name: string;
  } | null;
}

const TRANSACTIONS_PER_PAGE = 100;

export function TransactionsTable({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialTransactions.length === TRANSACTIONS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const newTransactions = await fetchTransactions(page)
    
    setTransactions(prev => [...prev, ...newTransactions])
    setPage(prev => prev + 1)
    setHasMore(newTransactions.length === TRANSACTIONS_PER_PAGE)
    setIsLoading(false)
  }, [page, isLoading, hasMore]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreTransactions()
        }
      },
      { rootMargin: "200px" } // Load more when 200px away from the bottom
    )

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loaderRef, loadMoreTransactions])

  return (
    <ScrollArea className="h-full">
      <Table>
        <TableHeader className="sticky top-0 bg-card/80 backdrop-blur-sm z-10">
          <TableRow>
            <TableHead>Transaction</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-full flex items-center justify-center">
                    <IconForCategory categoryName={transaction.type === 'transfer' ? 'Transfer' : (transaction.categories?.name || 'Uncategorized')} />
                  </div>
                  <div>
                    <p className="font-medium leading-none">
                      {transaction.description || (transaction.type === 'transfer' ? 'Transfer' : transaction.categories?.name) || 'Transaction'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type === 'transfer' ? 'Account Transfer' : (transaction.categories?.name || 'Uncategorized')}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={
                    transaction.type === 'transfer' ? 'outline' : (transaction.type === 'income' ? 'default' : 'secondary')
                  } 
                  className={
                    transaction.type === 'income' 
                      ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30' 
                      : transaction.type === 'expense'
                        ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
                        : ''
                  }>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === 'income' ? 'text-success' 
                : transaction.type === 'expense' ? 'text-destructive' 
                : 'text-muted-foreground'
              }`}>
                {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div ref={loaderRef} className="h-4" />
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <LoaderCircle className="animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading more transactions...</p>
        </div>
      )}
       {!hasMore && transactions.length > 0 && (
         <p className="text-center text-muted-foreground p-4">You've reached the end.</p>
       )}
       {transactions.length === 0 && !isLoading && (
         <div className="text-center text-muted-foreground p-10 flex flex-col items-center gap-4">
           <FileSearch className="w-16 h-16 text-muted-foreground/50"/>
           <h3 className="text-lg font-semibold">No transactions yet</h3>
           <p>Click "Add Transaction" to get started.</p>
         </div>
       )}
    </ScrollArea>
  )
}
