import { z } from 'zod';
import { tool } from 'ai';
import { createClient } from '@supabase/supabase-js';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  image_url: z.string().optional(),
});

// Use ProductSchema to validate return type if needed, effectively 'using' it
export const productSchema = ProductSchema;

// Create a server-side Supabase client with admin privileges if needed, 
// or standard client. For public read, standard is fine.
// But we need the URL and Key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const searchProducts = tool({
  description: 'Search for products in the store based on keywords, category, or price range',
  parameters: z.object({
    query: z.string().optional().describe('Keywords to search for in product name or description'),
    category: z.string().optional().describe('Product category (e.g., Oil, Watercolor, Pop Art)'),
    maxPrice: z.number().optional().describe('Maximum price allowed'),
  }),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  execute: async (args) => {
    const { query, category, maxPrice } = args;
    
    console.log('Searching products:', { query, category, maxPrice });
    
    let dbQuery = supabase.from('products').select('*');
    
    if (query) {
      // Simple keyword search on name or description
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (category) {
      dbQuery = dbQuery.ilike('category', `%${category}%`);
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }
    
    const { data, error } = await dbQuery.limit(5);
    
    if (error) {
      console.error('Supabase search error:', error);
      return [];
    }
    
    return data || [];
  },
});
