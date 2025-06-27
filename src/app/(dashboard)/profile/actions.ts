'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProfileFormSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters." }),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to update your profile.' }

  const validatedFields = ProfileFormSchema.safeParse({
    fullName: formData.get('fullName'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { fullName } = validatedFields.data

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) {
    console.error('Supabase profile update error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/profile')
  revalidatePath('/', 'layout') // Revalidate the whole layout to update name in header
  return { success: 'Profile updated successfully!' }
}
