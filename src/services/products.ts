import { SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultClient } from '@/lib/supabase'
import type { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '@/types/product'

const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'iPhone 15 Pro', 
    description: 'The ultimate iPhone.',
    price: 999, 
    stock: 10, 
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
    created_at: '2024-01-01T00:00:00Z',
    metadata: {
      features: { "Chip": "A17 Pro", "Display": "6.1-inch" },
      variants: [
        { name: "Color", values: ["Natural Titanium", "Blue Titanium"] },
        { name: "Storage", values: ["128GB", "256GB"] }
      ]
    }
  },
  { 
    id: '2', 
    name: 'Mechanical Keyboard', 
    description: 'Clicky and tactile.',
    price: 159, 
    stock: 20, 
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1',
    created_at: '2024-01-02T00:00:00Z'
  },
  { 
    id: '3', 
    name: 'Smart Watch', 
    description: 'Stay connected.',
    price: 299, 
    stock: 15, 
    category: 'Wearables',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    created_at: '2024-01-03T00:00:00Z'
  }
]

export async function getProducts(filter?: ProductFilter, supabase: SupabaseClient = defaultClient): Promise<Product[]> {
  if (process.env.MOCK_DATA === 'true') {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate latency
    
    let data = [...MOCK_PRODUCTS]

    if (filter?.category) {
      data = data.filter(p => p.category === filter.category)
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase()
      data = data.filter(p => p.name.toLowerCase().includes(q))
    }

    // Sort
    data.sort((a, b) => {
      switch (filter?.sort) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return data
  }

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

export async function getProductById(id: string, supabase: SupabaseClient = defaultClient): Promise<Product | null> {
  if (process.env.MOCK_DATA === 'true') {
    await new Promise(resolve => setTimeout(resolve, 300))
    return MOCK_PRODUCTS.find(p => p.id === id) || null
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getProductsByCategory(category: string, supabase: SupabaseClient = defaultClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createProduct(supabase: SupabaseClient, input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(supabase: SupabaseClient, id: string, input: UpdateProductInput): Promise<Product> {
  const updateData = { ...input }
  
  // Safe cleanup of read-only fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('id' in updateData) delete (updateData as any).id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('created_at' in updateData) delete (updateData as any).created_at
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
  
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Update failed: Product not found or permission denied (RLS)')
  }
  return data[0]
}

export async function deleteProduct(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
