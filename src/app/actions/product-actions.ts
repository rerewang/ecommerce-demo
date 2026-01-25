'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateEmbedding } from '@/lib/ai/embedding'
import { checkAlertsForProduct } from '@/services/notifications'
import { CreateProductInput, UpdateProductInput, Product } from '@/types/product'

import { searchProducts } from '@/lib/search/products'

/**
 * Server Action: Search products using hybrid search (semantic + metadata)
 */
export async function searchSemanticProductsAction(query: string) {
  return searchProducts(query)
}

/**
 * Server Action: Create a new product with embedding
 */
export async function createProductAction(input: CreateProductInput) {
  // 1. Generate embedding for the product
  // Combine name, description, and features for rich context
  const textContext = `${input.name}: ${input.description} ${input.metadata?.features ? JSON.stringify(input.metadata.features) : ''}`.trim()
  const embedding = await generateEmbedding(textContext)

  // 2. Setup Supabase client
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {}
        },
      },
    }
  )

  // 3. Insert product with embedding
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...input,
      embedding
    })
    .select()
    .single()

  if (error) throw error
  return data as Product
}

/**
 * Server Action: Update an existing product and regenerate embedding
 */
export async function updateProductAction(id: string, input: UpdateProductInput) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {}
        },
      },
    }
  )
  
  const { data: oldProduct, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !oldProduct) {
    throw new Error('Product not found')
  }

  let embedding = undefined
  if (input.name || input.description || input.metadata) {
     const name = input.name ?? oldProduct.name
     const description = input.description ?? oldProduct.description
     const metadata = input.metadata ?? oldProduct.metadata
     
     const textContext = `${name}: ${description} ${metadata?.features ? JSON.stringify(metadata.features) : ''}`.trim()
     embedding = await generateEmbedding(textContext)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...input }
  if (embedding) {
    updateData.embedding = embedding
  }

  delete updateData.id
  delete updateData.created_at

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  if (data) {
    if (input.price !== undefined && oldProduct.price !== undefined && input.price < oldProduct.price) {
       await checkAlertsForProduct(id, input.price, input.stock ?? oldProduct.stock, supabase, 'price_drop')
    }

    if (input.stock !== undefined && oldProduct.stock === 0 && input.stock > 0) {
       await checkAlertsForProduct(id, input.price ?? oldProduct.price, input.stock, supabase, 'restock')
    }
  }

  return data as Product
}

/**
 * Server Action: Regenerate embeddings for ALL products
 * NOTE: In production, this should be a background job or use cursor-based iteration
 * to avoid timeouts. For MVP (small dataset), a simple loop is fine.
 */
export async function regenerateAllEmbeddingsAction() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {}
        },
      },
    }
  )

  const { data: products, error } = await supabase.from('products').select('*')
  if (error) throw error

  let successCount = 0
  let errorCount = 0

  for (const product of products) {
    try {
      const textContext = `${product.name}: ${product.description} ${product.metadata?.features ? JSON.stringify(product.metadata.features) : ''}`.trim()
      const embedding = await generateEmbedding(textContext)

      await supabase
        .from('products')
        .update({ embedding })
        .eq('id', product.id)
      
      successCount++
    } catch (e) {
      console.error(`Failed to regenerate embedding for ${product.id}:`, e)
      errorCount++
    }
  }

  return { success: true, total: products.length, successCount, errorCount }
}
