'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const AccountFormSchema = z.object({
  name: z.string().min(1, { message: "Account name is required." }),
  type: z.string().min(1, { message: "Account type is required." }),
  balance: z.coerce.number(),
});

export async function addAccount(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to add an account.' }

  const validatedFields = AccountFormSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    balance: formData.get('balance'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { name, type, balance } = validatedFields.data
  
  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type,
    balance
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/accounts')
  revalidatePath('/transactions') // revalidate transactions page to get new account in dropdown
  return { success: 'Account added successfully!' }
}
