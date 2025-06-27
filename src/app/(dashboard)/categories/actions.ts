
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CategoryFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Category name is required." }),
  type: z.enum(['expense', 'income'], { required_error: "Category type is required." }),
});

export async function addCategory(prevState: any, formData: FormData) {
  const supabase = createClient()
  if (!supabase) return { error: 'Supabase client not available.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to add a category.' }

  const validatedFields = CategoryFormSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
  }

  const { name, type } = validatedFields.data

  // Check if a category with the same name and type already exists for this user
  const { data: existingCategory, error: existingError } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', name) // Case-insensitive check
    .eq('type', type)
    .single()

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error checking for existing category:', existingError);
      return { error: `Database error: ${existingError.message}` };
  }
  
  if (existingCategory) {
    return { error: `A category named "${name}" already exists.` }
  }

  const { error: insertError } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    type,
  })

  if (insertError) {
    console.error('Supabase insert error:', insertError)
    return { error: `Database error: ${insertError.message}` }
  }

  revalidatePath('/categories')
  return { success: 'Category added successfully!' }
}
