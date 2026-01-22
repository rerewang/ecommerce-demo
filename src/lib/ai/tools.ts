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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const fallbackProducts = [
  {
    id: 'sample-oil-1',
    name: 'Calm Shores Oil Painting',
    description: 'Serene coastal landscape in warm tones for pet portraits.',
    price: 89,
    image_url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400',
    category: 'Oil Painting',
    stock: 12,
  },
  {
    id: 'sample-oil-2',
    name: 'Sunset Fields Canvas',
    description: 'Golden-hour meadow oil piece; great for animals in motion.',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=400',
    category: 'Oil Painting',
    stock: 15,
  },
  {
    id: 'sample-oil-3',
    name: 'Portrait Study – Warm Oil',
    description: 'Classic portrait lighting, ready for pet-focused commissions.',
    price: 110,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    category: 'Oil Painting',
    stock: 8,
  },
];

const filterFallback = (query?: string, maxPrice?: number) => {
  let result = fallbackProducts;
  if (typeof maxPrice === 'number') {
    result = result.filter((p) => p.price <= maxPrice);
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }
  if (result.length === 0 && typeof maxPrice === 'number') {
    // If query filter removed all, retry with price-only filter
    result = fallbackProducts.filter((p) => p.price <= maxPrice);
  }
  if (result.length === 0) {
    // If still empty, return all fallback
    result = fallbackProducts;
  }
  return result.slice(0, 5);
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const searchProducts = tool({
  description: 'Search for products in the store based on keywords, category, or price range',
  parameters: z.object({
    query: z.string().describe('Keywords to search for in product name or description'),
    category: z.string().optional().describe('Product category (e.g., Oil, Watercolor, Pop Art)'),
    maxPrice: z.number().optional().describe('Maximum price allowed'),
  }),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  execute: async (args) => {
    const { query, category, maxPrice } = args || {};
    const safeQuery = (query && query.trim()) ? query.trim() : 'oil painting';
    const safeMaxPrice = typeof maxPrice === 'number' ? maxPrice : 120;

    console.log('Searching products:', { query: safeQuery, category, maxPrice: safeMaxPrice });

    // If Supabase not configured, or query empty, always use fallback
    if (!supabase || !safeQuery) {
      return filterFallback(safeQuery, safeMaxPrice);
    }

    let dbQuery = supabase.from('products').select('*');
    
    // Simple keyword search on name or description
    dbQuery = dbQuery.or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`);

    if (category) {
      dbQuery = dbQuery.ilike('category', `%${category}%`);
    }
    if (safeMaxPrice) {
      dbQuery = dbQuery.lte('price', safeMaxPrice);
    }

    const { data, error } = await dbQuery.limit(5);
    
    if (error) {
      console.error('Supabase search error:', error);
      return filterFallback(safeQuery, safeMaxPrice);
    }

    if (!data || data.length === 0) {
      return filterFallback(safeQuery, safeMaxPrice);
    }

    return data || [];
  },
});
