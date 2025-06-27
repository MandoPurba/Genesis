'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema for Income/Expense
const IncomeExpenseFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  date: z.coerce.date(),
  categoryId: z.coerce.number({ required_error: "Please select a category." }),
  accountId: z.coerce.number({ required_error: "Please select an account." }),
  description: z.string().max(100, "Description is too long.").optional(),
});

// Schema for Transfer
const TransferFormSchema = z.object({
  type: z.literal('transfer'),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  date: z.coerce.date(),
  fromAccountId: z.coerce.number({ required_error: "Please select the 'from' account." }),
  toAccountId: z.coerce.number({ required_error: "Please select the 'to' account." }),
  description: z.string().max(100, "Description is too long.").optional(),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: "From and To accounts cannot be the same.",
  path: ["toAccountId"],
});


export async function addTransaction(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to add a transaction.' }

  const type = formData.get('type') as 'income' | 'expense' | 'transfer';
  let validatedFields;
  let dataForDb;

  if (type === 'transfer') {
    validatedFields = TransferFormSchema.safeParse({
      type: 'transfer',
      amount: formData.get('amount'),
      date: formData.get('date'),
      description: formData.get('description'),
      fromAccountId: formData.get('fromAccountId'),
      toAccountId: formData.get('toAccountId'),
    });

    if (validatedFields.success) {
      const { amount, date, description, fromAccountId, toAccountId } = validatedFields.data;
      dataForDb = {
        user_id: user.id,
        type: 'transfer',
        amount,
        date: date.toISOString(),
        account_id: fromAccountId,
        to_account_id: toAccountId,
        description: description || null,
        category_id: null,
      };
    }
  } else {
     validatedFields = IncomeExpenseFormSchema.safeParse({
      type: type,
      amount: formData.get('amount'),
      date: formData.get('date'),
      categoryId: formData.get('categoryId'),
      accountId: formData.get('accountId'),
      description: formData.get('description'),
    });
    
    if (validatedFields.success) {
      const { type, amount, date, categoryId, accountId, description } = validatedFields.data;
      dataForDb = {
        user_id: user.id,
        type,
        amount,
        date: date.toISOString(),
        category_id: categoryId,
        account_id: accountId,
        description: description || null,
        to_account_id: null,
      };
    }
  }

  if (!validatedFields.success) {
    return { error: 'Invalid form data. Please check the fields.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { error: transactionError } = await supabase.from('transactions').insert(dataForDb);

  if (transactionError) {
    console.error('Supabase transaction insert error:', transactionError)
    return { error: `Database error: ${transactionError.message}` }
  }

  revalidatePath('/transactions')
  revalidatePath('/overview')
  revalidatePath('/budgets')
  revalidatePath('/accounts')
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
