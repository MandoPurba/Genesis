
"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { updateCategory } from "@/app/(dashboard)/categories/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Category } from "@/app/(dashboard)/categories/page"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

interface EditCategorySheetProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategorySheet({ category, open, onOpenChange }: EditCategorySheetProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [state, formAction] = useActionState(updateCategory, null)
  
  const formKey = open ? `form-${category.id}` : 'form-closed';


  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      router.refresh()
      onOpenChange(false)
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
    }
  }, [state, toast, router, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Modify the details for your category. This is only possible if the category has not been used.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} key={formKey} className="flex flex-col flex-1">
          <input type="hidden" name="id" value={category.id} />
          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-6">
            
            <div>
              <Label htmlFor="name-edit">Category Name</Label>
              <Input
                id="name-edit"
                name="name"
                placeholder="e.g., Groceries, Salary"
                defaultValue={category.name}
                required
              />
              {state?.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
            </div>
            
            <div>
                <Label>Category Type</Label>
                <RadioGroup name="type" defaultValue={category.type} className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <RadioGroupItem value="expense" id="expense-edit" className="peer sr-only" />
                        <Label htmlFor="expense-edit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        Expense
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="income" id="income-edit" className="peer sr-only" />
                        <Label htmlFor="income-edit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
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
