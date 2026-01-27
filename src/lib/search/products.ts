import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateEmbedding } from '@/lib/ai/embedding'
import { translateQuery } from '@/lib/ai/query-translator'
import { Product } from '@/types/product'

/**
 * Semantic search for products using vector similarity.
 * Can be used by Server Actions and Route Handlers.
 */
export async function searchProducts(query: string, matchCount = 10): Promise<Product[]> {
  if (!query) return []

  // 1. Translate/Optimize query for FTS (Full Text Search)
  // Since our FTS index is primarily English, we need to translate Chinese/other queries to English
  // to get good keyword matching.
  const translatedQuery = await translateQuery(query)

  // 2. Generate embedding from the ORIGINAL query
  // We use the raw query for vector search because:
  // a) Our embedding model (bge-m3) is multilingual
  // b) Our product data contains both English and Chinese fields (name_zh, description_zh)
  // c) This preserves the original semantic nuance that might be lost in translation
  const embedding = await generateEmbedding(query)

  // Check if embedding is valid (not zero vector)
  const isZeroVector = embedding.every(v => v === 0)
  if (isZeroVector) {
    console.warn('Embedding generation failed (zero vector), falling back to simple text search')
    // Fallback to simple ilike search via existing service or direct query
    // Since we don't have direct access to Supabase service here easily without circular deps or duplicating logic,
    // we will run a simple text search query using the server client.
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll() },
            setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
          },
        }
    )
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${translatedQuery}%`)
      .limit(matchCount)
    
    return (data || []) as Product[]
  }

  // 3. Setup Supabase client
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
           } catch {
             // Ignored
           }
        },
      },
    }
  )

  // 4. Call the hybrid search RPC function (RRF)
  const { data, error } = await supabase.rpc('match_products_hybrid', {
    query_text: translatedQuery,
    query_embedding: embedding,
    match_count: matchCount,
    rrf_k: 60
  })

  if (error) {
    // Fallback to vector-only search if hybrid function doesn't exist (migration pending)
    console.warn('Hybrid search failed, falling back to vector search:', error.message)
    const { data: fallbackData, error: fallbackError } = await supabase.rpc('match_products', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: matchCount
    })
    
    if (fallbackError) {
       console.error('Semantic search error:', fallbackError)
       return []
    }
    return fallbackData as Product[]
  }

  return data as Product[]
}
