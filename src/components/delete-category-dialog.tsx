
"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { deleteCategory } from "@/app/(dashboard)/categories/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Category } from "@/app/(dashboard)/categories/page"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <AlertDialogAction asChild>
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </AlertDialogAction>
  )
}

interface DeleteCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({ category, open, onOpenChange }: DeleteCategoryDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [state, formAction] = useActionState(deleteCategory, null)
  const formKey = `delete-form-${category.id}`;

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.success })
      router.refresh()
      onOpenChange(false)
    } else if (state?.error) {
      toast({ title: "Error", description: state.error, variant: "destructive" })
      onOpenChange(false) // Close dialog even on error, toast shows the message
    }
  }, [state, toast, router, onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the 
            <span className="font-semibold text-foreground"> {category.name} </span> 
            category. This is only possible if the category has not been used.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} key={formKey}>
            <input type="hidden" name="id" value={category.id} />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <SubmitButton />
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
