import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: Using Anon Key. RLS might prevent updates. Service Role Key recommended.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // Import dynamically to ensure env vars are loaded first
  const { generateEmbedding } = await import('../src/lib/ai/embedding')

  console.log('Fetching products...')
  const { data: products, error } = await supabase.from('products').select('*')
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }


  console.log(`Found ${products.length} products. Generating embeddings...`)

  let successCount = 0
  let errorCount = 0

  for (const product of products) {
    const { id, name, description, metadata } = product
    
    try {
      const textContext = `${name}: ${description} ${metadata?.features ? JSON.stringify(metadata.features) : ''}`.trim()
      
      console.log(`Generating embedding for: "${name}"...`)
      const embedding = await generateEmbedding(textContext)
      
      if (!embedding || embedding.length === 0) {
        console.error(`ERROR: Generated embedding is empty for ${name}`)
        errorCount++
        continue
      }
      console.log(`  -> Vector generated. Length: ${embedding.length}`)

      const { error: updateError } = await supabase
        .from('products')
        .update({ embedding })
        .eq('id', id)
      
      if (updateError) {
        console.error(`  -> Failed to update DB for ${name}:`, updateError)
        errorCount++
      } else {
        console.log(`  -> DB Update Success!`)
        successCount++
      }
    } catch (e) {
      console.error(`\nFailed to generate embedding for ${name}:`, e)
      errorCount++
    }
  }
  
  console.log('\nDone!')
  console.log(`Success: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
}

main()
