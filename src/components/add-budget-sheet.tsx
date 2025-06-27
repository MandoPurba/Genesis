
"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { addBudget } from "@/app/(dashboard)/budgets/actions"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usePrivacy } from "@/contexts/privacy-context"

// Updated type to match schema (bigint -> number)
type Category = { id: number; name: string; }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Budget"}
    </Button>
  )
}

export function AddBudgetSheet({ categories }: { categories: Category[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const { isPrivacyMode } = usePrivacy();
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addBudget, null)

  const [amountValue, setAmountValue] = useState('')
  const [key, setKey] = useState(Date.now()); // Used to reset form

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      router.refresh()
      setOpen(false)
      // Reset form state by changing key
      setAmountValue('')
      setKey(Date.now())
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast, router])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setAmountValue(rawValue);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Set a New Budget</SheetTitle>
          <SheetDescription>
            Create a spending limit for a category for the current month.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} key={key} className="flex flex-col flex-1">
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-6">
            
            <input type="hidden" name="amount" value={amountValue} />

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    // Convert number ID to string for the value prop
                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.categoryId && <p className="text-destructive text-sm mt-1">{state.errors.categoryId[0]}</p>}
            </div>

            <div>
              <Label htmlFor="amount-display">Budget Amount</Label>
              <Input
                id="amount-display"
                type="text"
                placeholder="e.g., Rp 1.000.000"
                value={amountValue === '' ? '' : formatCurrency(Number(amountValue), isPrivacyMode)}
                onChange={handleAmountChange}
                required
              />
              {state?.errors?.amount && <p className="text-destructive text-sm mt-1">{state.errors.amount[0]}</p>}
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
