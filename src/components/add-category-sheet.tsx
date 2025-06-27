
"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { addCategory } from "@/app/(dashboard)/categories/actions"
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
import { useToast } from "@/hooks/use-toast"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Category"}
    </Button>
  )
}

export function AddCategorySheet() {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(addCategory, null)
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      router.refresh()
      setOpen(false)
      setKey(Date.now()) // Reset form by changing key
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast, router])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Category</SheetTitle>
          <SheetDescription>
            Add a new category for your transactions.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} key={key} className="flex flex-col flex-1">
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-6">
            
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Groceries, Salary"
                required
              />
              {state?.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
            </div>
            
            <div>
                <Label>Category Type</Label>
                <RadioGroup name="type" defaultValue="expense" className="grid grid-cols-2 gap-4 mt-2">
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
                {state?.errors?.type && <p className="text-destructive text-sm mt-1">{state.errors.type[0]}</p>}
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
