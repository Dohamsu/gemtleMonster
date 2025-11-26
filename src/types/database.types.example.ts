// Example: How to use auto-generated database types

import { Database } from './types/database.types'

// Extract table types
export type DbRecipe = Database['public']['Tables']['recipe']['Row']
export type DbRecipeInsert = Database['public']['Tables']['recipe']['Insert']
export type DbRecipeUpdate = Database['public']['Tables']['recipe']['Update']

export type DbRecipeCondition = Database['public']['Tables']['recipe_condition']['Row']
export type DbMaterial = Database['public']['Tables']['material']['Row']
export type DbRecipeIngredient = Database['public']['Tables']['recipe_ingredient']['Row']

// Example usage in API functions
async function getRecipeWithConditions(recipeId: string): Promise<DbRecipe | null> {
    const { data, error } = await supabase
        .from('recipe')
        .select(`
      *,
      recipe_condition (*),
      recipe_ingredient (*)
    `)
        .eq('id', recipeId)
        .single()

    return data
}

// Type-safe insert
async function createRecipe(recipe: DbRecipeInsert): Promise<DbRecipe | null> {
    const { data, error } = await supabase
        .from('recipe')
        .insert(recipe)
        .select()
        .single()

    return data
}

// Type-safe update
async function updateRecipe(id: string, updates: DbRecipeUpdate): Promise<DbRecipe | null> {
    const { data, error } = await supabase
        .from('recipe')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    return data
}

// Note: DB types use snake_case (matching database columns)
// Example: recipe_condition has value_int, value_json, etc.
