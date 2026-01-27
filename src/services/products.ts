import { SupabaseClient } from '@supabase/supabase-js'
import { supabase as defaultClient } from '@/lib/supabase'
import type { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '@/types/product'

const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'The Royal Paws', 
    name_zh: '皇家爪印',
    description: 'A majestic oil painting that transforms your pet into a 17th-century aristocrat.',
    description_zh: '一幅庄严的油画，将您的宠物化身为17世纪的贵族。',
    price: 149, 
    stock: 50, 
    category: 'Oil Painting',
    image_url: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?q=80&w=1000&auto=format&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    metadata: {
      features: { "Style": "Renaissance", "Mood": "Majestic" },
      variants: [
        { name: "Size", values: ["12x16", "18x24", "24x36"] },
        { name: "Frame", values: ["Gold", "Wood", "None"] }
      ]
    }
  },
  { 
    id: '2', 
    name: 'Neon Whisker 2077', 
    name_zh: '霓虹胡须 2077',
    description: 'Dive into the future with this cyberpunk-inspired digital masterpiece.',
    description_zh: '沉浸在这部受赛博朋克启发的数字杰作中。',
    price: 89, 
    stock: 100, 
    category: 'Digital Art',
    image_url: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1000&auto=format&fit=crop',
    created_at: '2024-01-02T00:00:00Z'
  },
  { 
    id: '3', 
    name: 'Pixar-Perfect Portrait', 
    name_zh: '皮克斯萌宠肖像',
    description: 'Bring the magic of 3D animation to your home.',
    description_zh: '将3D动画的魔力带入您的家中。',
    price: 129, 
    stock: 75, 
    category: 'Digital Art',
    image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1000&auto=format&fit=crop',
    created_at: '2024-01-03T00:00:00Z'
  },
  { 
    id: '4', 
    name: 'Pop Art Paws', 
    name_zh: '波普爪爪',
    description: 'Bold, colorful, and iconic. Inspired by Andy Warhol.',
    description_zh: '大胆、多彩且具有标志性。受安迪·沃霍尔的启发。',
    price: 79, 
    stock: 120, 
    category: 'Digital Art',
    image_url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1000&auto=format&fit=crop',
    created_at: '2024-01-04T00:00:00Z'
  },
  { 
    id: '5', 
    name: 'Ethereal Flow', 
    name_zh: '缥缈流影',
    description: 'A delicate watercolor painting that blends soft hues and fluid lines.',
    description_zh: '一幅精致的水彩画，融合了柔和的色调和流畅的线条。',
    price: 69, 
    stock: 80, 
    category: 'Watercolor',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop',
    created_at: '2024-01-05T00:00:00Z'
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
  // 1. Get old product data first for comparison
  const { data: oldProduct } = await supabase
    .from('products')
    .select('price, stock')
    .eq('id', id)
    .single()

  if (!oldProduct) {
    throw new Error('Product not found')
  }

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

  const updatedProduct = data[0]

  // 2. Check for alerts if price dropped or stock increased from 0
  const { checkAlertsForProduct } = await import('@/services/notifications')
  
  // Check price drop
  if (updateData.price !== undefined && updateData.price < oldProduct.price) {
    await checkAlertsForProduct(id, updateData.price, updateData.stock ?? oldProduct.stock, supabase, 'price_drop')
  }
  
  // Check restock
  if (updateData.stock !== undefined && oldProduct.stock === 0 && updateData.stock > 0) {
    await checkAlertsForProduct(id, updateData.price ?? oldProduct.price, updateData.stock, supabase, 'restock')
  }

  return updatedProduct
}

export async function deleteProduct(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
