import { supabase } from '@/lib/supabase'
import type { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '@/types/product'

export async function getProducts(filter?: ProductFilter): Promise<Product[]> {
  let query = supabase.from('products').select('*')

  if (filter?.category) {
    query = query.eq('category', filter.category)
  }

  if (filter?.query) {
    query = query.ilike('name', `%${filter.query}%`)
  }

  switch (filter?.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
