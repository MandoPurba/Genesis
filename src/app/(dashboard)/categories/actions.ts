
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


const UpdateCategoryFormSchema = z.object({
  id: z.coerce.number(),
  name: z.string().trim().min(1, { message: "Category name is required." }),
  type: z.enum(['expense', 'income'], { required_error: "Category type is required." }),
});

export async function updateCategory(prevState: any, formData: FormData) {
    const supabase = createClient()
    if (!supabase) return { error: 'Supabase client not available.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in to update a category.' }

    const validatedFields = UpdateCategoryFormSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        type: formData.get('type'),
    })

    if (!validatedFields.success) {
        return { error: 'Invalid form data.', errors: validatedFields.error.flatten().fieldErrors }
    }

    const { id, name, type } = validatedFields.data

    // Check if category is used in transactions
    const { count, error: transactionError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category_id', id)

    if (transactionError) {
        console.error('Error checking transactions:', transactionError)
        return { error: `Database error: ${transactionError.message}` }
    }
    if (count && count > 0) {
        return { error: 'This category is already used in transactions and cannot be edited.' }
    }

    // Check for duplicate name
     const { data: existingCategory, error: existingError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', name) // Case-insensitive check
        .eq('type', type)
        .not('id', 'eq', id) // Exclude the current category from the check
        .single()
    
    if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking for existing category:', existingError);
        return { error: `Database error: ${existingError.message}` };
    }
    if (existingCategory) {
        return { error: `Another category named "${name}" already exists.` }
    }


    const { error: updateError } = await supabase
        .from('categories')
        .update({ name, type })
        .eq('id', id)
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Supabase update error:', updateError)
        return { error: `Database error: ${updateError.message}` }
    }

    revalidatePath('/categories')
    revalidatePath('/transactions')
    revalidatePath('/overview')
    return { success: 'Category updated successfully!' }
}

const DeleteCategorySchema = z.object({
  id: z.coerce.number(),
});

export async function deleteCategory(prevState: any, formData: FormData) {
    const supabase = createClient()
    if (!supabase) return { error: 'Supabase client not available.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in to delete a category.' }

    const validatedFields = DeleteCategorySchema.safeParse({
        id: formData.get('id'),
    })

    if (!validatedFields.success) {
        return { error: 'Invalid category ID.' }
    }

    const { id } = validatedFields.data

     // Check if category is used in transactions
    const { count, error: transactionError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category_id', id)

    if (transactionError) {
        console.error('Error checking transactions:', transactionError)
        return { error: `Database error: ${transactionError.message}` }
    }
    if (count && count > 0) {
        return { error: 'This category is used in transactions and cannot be deleted.' }
    }

    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (deleteError) {
        console.error('Supabase delete error:', deleteError)
        return { error: `Database error: ${deleteError.message}` }
    }

    revalidatePath('/categories')
    return { success: 'Category deleted successfully!' }
}
