"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
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
import { PlusCircle } from "lucide-react"

type Category = { id: string; name: string; type: 'income' | 'expense' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Transaction"}
    </Button>
  )
}

export function AddTransactionSheet({ categories }: { categories: Category[] }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addTransaction, null)

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [key, setKey] = useState(Date.now()); // Used to reset form

  const filteredCategories = categories.filter(c => c.type === transactionType)

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      setOpen(false)
      // Reset form state by changing key
      setDate(new Date())
      setTransactionType('expense')
      setKey(Date.now())
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
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

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="1" placeholder="e.g., 50000" required />
              {state?.errors?.amount && <p className="text-destructive text-sm mt-1">{state.errors.amount[0]}</p>}
            </div>

            <div>
              <Label>Date</Label>
              <DatePicker date={date} setDate={setDate} disabled={(date) => date > new Date()} />
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
          </div>
          <SheetFooter className="mt-auto pt-4 border-t">
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
