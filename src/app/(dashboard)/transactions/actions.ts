'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const TransactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  date: z.coerce.date(),
  categoryId: z.coerce.number({ required_error: "Please select a category." }),
  description: z.string().max(100, "Description is too long.").optional(),
});

export async function addTransaction(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to add a transaction.' }

  const validatedFields = TransactionFormSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    categoryId: formData.get('categoryId'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data. Please check the fields.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { type, amount, date, categoryId, description } = validatedFields.data

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    amount,
    date: date.toISOString(),
    category_id: categoryId,
    description: description || null,
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/transactions')
  revalidatePath('/overview')
  revalidatePath('/budgets')
  return { success: 'Transaction added successfully!' }
}

const TRANSACTIONS_PER_PAGE = 100;

export async function fetchTransactions(page: number) {
  const supabase = createClient()
  if (!supabase) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const from = page * TRANSACTIONS_PER_PAGE
  const to = from + TRANSACTIONS_PER_PAGE - 1

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(id, name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false})
    .range(from, to)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || [];
}
