import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client singleton
let browserClient: ReturnType<typeof createBrowserClient> | null = null

// Browser client for client components that need auth context
export function createClientComponentClient() {
  if (typeof window === 'undefined') {
    // Return a new client for server-side rendering (though this function is typically used in client components)
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return browserClient
}

export async function createServerClient() {
  const cookieStore = await cookies()
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          stock: number
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
    }
  }
}
