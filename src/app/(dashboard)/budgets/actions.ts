'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BudgetFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  categoryId: z.string({ required_error: "Please select a category." }).uuid(),
});

export async function addBudget(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to add a budget.' }

  const validatedFields = BudgetFormSchema.safeParse({
    amount: formData.get('amount'),
    categoryId: formData.get('categoryId'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { amount, categoryId } = validatedFields.data
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  const { data: existingBudget, error: existingError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .eq('year', year)
    .eq('month', month)
    .single();

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error checking for existing budget:', existingError);
      return { error: `Database error: ${existingError.message}` };
  }

  if (existingBudget) {
      return { error: 'A budget for this category already exists for the current month.' }
  }

  const { error } = await supabase.from('budgets').insert({
    user_id: user.id,
    amount,
    category_id: categoryId,
    year,
    month,
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/budgets')
  return { success: 'Budget added successfully!' }
}
