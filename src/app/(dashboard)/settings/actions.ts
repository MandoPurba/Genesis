'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const GoogleAnalyticsFormSchema = z.object({
  measurementId: z.string().trim().refine(val => val === '' || val.startsWith('G-'), {
    message: "Measurement ID must start with 'G-' or be empty.",
  }),
});

export async function updateGoogleAnalyticsId(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to update settings.' }

  const validatedFields = GoogleAnalyticsFormSchema.safeParse({
    measurementId: formData.get('measurementId'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { measurementId } = validatedFields.data

  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'ga_measurement_id', value: measurementId })

  if (error) {
    if (error.code === '42P01') {
        return { error: 'The `settings` table does not exist in your database. Please create it first.' }
    }
    console.error('Supabase settings upsert error:', error)
    return { error: `Database error: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  return { success: 'Google Analytics settings updated successfully!' }
}
