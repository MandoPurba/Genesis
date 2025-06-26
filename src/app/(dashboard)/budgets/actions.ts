'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// The schema now expects a number for categoryId
const BudgetFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  categoryId: z.coerce.number({ required_error: "Please select a category." }),
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
  // Get the first day of the current month, formatted as YYYY-MM-DD
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Check if a budget for this category and month already exists
  const { data: existingBudget, error: existingError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .eq('start_date', startDate)
    .single();

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error checking for existing budget:', existingError);
      return { error: `Database error: ${existingError.message}` };
  }

  if (existingBudget) {
      return { error: 'A budget for this category already exists for the current month.' }
  }

  // Insert the new budget with the correct schema
  const { error } = await supabase.from('budgets').insert({
    user_id: user.id,
    amount,
    category_id: categoryId,
    start_date: startDate,
    period: 'monthly', // Assuming 'monthly' for now, as per schema
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/budgets')
  return { success: 'Budget added successfully!' }
}
