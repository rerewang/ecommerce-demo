import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClientComponentClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return browserClient
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
      returns: {
        Row: {
          id: string
          order_id: string
          user_id: string
          status: 'requested' | 'approved' | 'rejected' | 'completed'
          reason: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['returns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['returns']['Insert']>
      }
      product_alerts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          type: 'price_drop' | 'restock'
          target_price: number | null
          status: 'active' | 'triggered' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_alerts']['Insert']>
      }
    }
  }
}
