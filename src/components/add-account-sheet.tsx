"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { addAccount } from "@/app/(dashboard)/accounts/actions"
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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Account"}
    </Button>
  )
}

const accountTypes = ['Bank Account', 'Cash', 'E-Wallet', 'Other'];

export function AddAccountSheet() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addAccount, null)
  const [key, setKey] = useState(Date.now());
  const [balanceValue, setBalanceValue] = useState('');

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      setOpen(false)
      setKey(Date.now())
      setBalanceValue('')
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast])

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setBalanceValue(rawValue);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Account</SheetTitle>
          <SheetDescription>
            Add a new financial account to track your balance.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} key={key} className="flex flex-col flex-1">
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-6">
            
            <input type="hidden" name="balance" value={balanceValue || '0'} />

            <div>
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., BCA Main, GoPay Wallet"
                required
              />
              {state?.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
            </div>
            
            <div>
              <Label htmlFor="type">Account Type</Label>
              <Select name="type" required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select an account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.type && <p className="text-destructive text-sm mt-1">{state.errors.type[0]}</p>}
            </div>

            <div>
              <Label htmlFor="balance-display">Initial Balance (Optional)</Label>
              <Input
                id="balance-display"
                type="text"
                placeholder="e.g., Rp 1.000.000"
                value={balanceValue === '' ? '' : formatCurrency(Number(balanceValue))}
                onChange={handleBalanceChange}
              />
               {state?.errors?.balance && <p className="text-destructive text-sm mt-1">{state.errors.balance[0]}</p>}
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
