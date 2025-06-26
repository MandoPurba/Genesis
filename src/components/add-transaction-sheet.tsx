"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { addTransaction } from "@/app/(dashboard)/transactions/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/datepicker"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Category = { id: number; name: string; type: 'income' | 'expense' }
type Account = { id: number; name: string; }
type BudgetInfo = { [categoryId: number]: { budget: number; spent: number; } }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Transaction"}
    </Button>
  )
}

export function AddTransactionSheet({ categories, accounts, budgetInfo }: { categories: Category[]; accounts: Account[]; budgetInfo: BudgetInfo }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addTransaction, null)

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [amountValue, setAmountValue] = useState('')
  const [key, setKey] = useState(Date.now()); // Used to reset form
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()
  const [overBudgetWarning, setOverBudgetWarning] = useState<string | null>(null)

  const filteredCategories = categories.filter(c => c.type === transactionType)

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      setOpen(false)
      // Reset form state by changing key
      setDate(new Date())
      setTransactionType('expense')
      setAmountValue('')
      setSelectedCategoryId(undefined)
      setOverBudgetWarning(null)
      setKey(Date.now())
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast])

  useEffect(() => {
    // Reset selected category when type changes
    setSelectedCategoryId(undefined)
  }, [transactionType])

  useEffect(() => {
    if (transactionType === 'expense' && selectedCategoryId && amountValue) {
      const categoryIdNum = Number(selectedCategoryId)
      const budgetDetails = budgetInfo[categoryIdNum]
      const newAmount = Number(amountValue) || 0

      if (budgetDetails) {
        const { budget, spent } = budgetDetails
        const potentialRemaining = budget - spent - newAmount

        if (potentialRemaining < 0) {
          const overage = formatCurrency(Math.abs(potentialRemaining))
          setOverBudgetWarning(`This transaction will exceed your budget for this category by ${overage}.`)
        } else {
          setOverBudgetWarning(null)
        }
      } else {
        setOverBudgetWarning(null)
      }
    } else {
      setOverBudgetWarning(null)
    }
  }, [selectedCategoryId, amountValue, transactionType, budgetInfo])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmountValue(rawValue);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add a New Transaction</SheetTitle>
          <SheetDescription>
            Enter the details of your income or expense.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} key={key} className="flex flex-col flex-1">
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-6">
            <RadioGroup
              name="type"
              value={transactionType}
              onValueChange={(value: 'income' | 'expense') => setTransactionType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="expense" id="expense" className="peer sr-only" />
                <Label htmlFor="expense" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Expense
                </Label>
              </div>
              <div>
                <RadioGroupItem value="income" id="income" className="peer sr-only" />
                <Label htmlFor="income" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  Income
                </Label>
              </div>
            </RadioGroup>
            
            <input type="hidden" name="date" value={date?.toISOString()} />
            <input type="hidden" name="amount" value={amountValue} />

            <div>
              <Label htmlFor="amount-display">Amount</Label>
              <Input
                id="amount-display"
                type="text"
                placeholder="e.g., Rp 50.000"
                value={amountValue === '' ? '' : formatCurrency(Number(amountValue))}
                onChange={handleAmountChange}
                required
              />
              {state?.errors?.amount && <p className="text-destructive text-sm mt-1">{state.errors.amount[0]}</p>}
            </div>

            <div>
              <Label>Date</Label>
              <DatePicker date={date} setDate={setDate} disabled={(date) => date > new Date()} />
            </div>

            <div>
              <Label htmlFor="accountId">Account</Label>
              <Select name="accountId" required>
                <SelectTrigger id="accountId">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.accountId && <p className="text-destructive text-sm mt-1">{state.errors.accountId[0]}</p>}
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select 
                name="categoryId" 
                required
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.categoryId && <p className="text-destructive text-sm mt-1">{state.errors.categoryId[0]}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="e.g., Groceries from the market" />
              {state?.errors?.description && <p className="text-destructive text-sm mt-1">{state.errors.description[0]}</p>}
            </div>

            {overBudgetWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Budget Warning</AlertTitle>
                <AlertDescription>{overBudgetWarning}</AlertDescription>
              </Alert>
            )}

          </div>
          <SheetFooter className="mt-auto pt-4 border-t">
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
