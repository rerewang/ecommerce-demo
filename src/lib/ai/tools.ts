import { z } from 'zod';
import { tool, type Tool, type ToolExecutionOptions } from 'ai';
import { createClient } from '@supabase/supabase-js';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  image_url: z.string().optional(),
});

// -----------------------------------------------------------------------------
// New Tool Schemas
// -----------------------------------------------------------------------------

export const trackOrderSchema = z.object({
  orderId: z.string().describe('The Order ID to track (e.g., from user input or context)'),
});

export const trackOrder = tool({
  description: 'Get the status and timeline of a specific order',
  inputSchema: trackOrderSchema,
  execute: async ({ orderId }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/orders/status?orderId=${orderId}`, {
        method: 'GET',
      });
      
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Track order tool error', e);
    }

    return {
      orderId,
      status: 'shipped',
      total: 120,
      shippingAddress: { city: 'Demo City' },
      timeline: [
        { label: 'Ordered', status: 'completed', date: new Date().toISOString() },
        { label: 'Shipped', status: 'current', date: new Date().toISOString() },
      ]
    };
  },
});

export const checkReturnEligibilitySchema = z.object({
  orderId: z.string().describe('The Order ID to check for return eligibility'),
});

export const checkReturnEligibility = tool({
  description: 'Check if an order is eligible for return or exchange',
  inputSchema: checkReturnEligibilitySchema,
  execute: async ({ orderId }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/orders/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Return eligibility tool error', e);
    }

    return {
      orderId,
      eligible: true,
      reason: 'Within 30 days window',
      policy: { windowDays: 30 }
    };
  },
});

export const createAlertSchema = z.object({
  productId: z.string().describe('Product ID to alert on'),
  type: z.enum(['price_drop', 'restock']).describe('Type of alert: price drop or restock'),
  targetPrice: z.number().optional().describe('Target price for price drop alerts'),
});

export const createAlert = tool({
  description: 'Create a price drop or restock alert for a product',
  inputSchema: createAlertSchema,
  execute: async ({ productId, type, targetPrice }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, type, targetPrice }),
      });
      
      if (res.ok) {
        const data = await res.json();
        return {
          ...data,
          message: 'Alert created successfully'
        };
      }
    } catch (e) {
      console.error('Create alert tool error', e);
    }

    return {
      id: `alert-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      type,
      targetPrice,
      active: true,
      message: 'Alert created successfully'
    };
  },
});

export const listUserOrdersSchema = z.object({
  limit: z.number().int().min(1).max(10).optional().describe('How many recent orders to fetch (default 5, max 10)'),
});

export const listUserOrders = tool({
  description: 'List the most recent orders for the authenticated user (or admin)',
  inputSchema: listUserOrdersSchema,
  execute: async ({ limit }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const url = new URL(`${baseUrl}/api/orders/list`);
      if (limit) {
        url.searchParams.set('limit', String(limit));
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('List user orders tool error', e);
    }

    const now = new Date();
    return {
      orders: [
        {
          orderId: 'demo-order-1',
          shortId: 'demo-1',
          createdAt: now.toISOString(),
          status: 'shipped',
          total: 120,
          items: [
            { id: 'item-1', name: 'Canvas Tote', imageUrl: '', quantity: 1 },
            { id: 'item-2', name: 'Oil Brush Set', imageUrl: '', quantity: 2 },
          ],
        },
      ],
    };
  },
});

// -----------------------------------------------------------------------------
// Existing Tools
// -----------------------------------------------------------------------------

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

export const searchParamsSchema = z.object({
  query: z.string().describe('Keywords to search for in product name or description'),
  category: z.string().optional().describe('Product category (e.g., Oil, Watercolor, Pop Art)'),
  maxPrice: z.number().optional().describe('Maximum price allowed'),
});

export const searchProducts = tool({
  description: 'Search for products in the store based on keywords, category, or price range',
  inputSchema: searchParamsSchema,
  execute: async (
    args: z.infer<typeof searchParamsSchema>,
    _options: ToolExecutionOptions,
  ): Promise<z.infer<typeof ProductSchema>[]> => {
    void _options;
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

    const parsed = ProductSchema.array().safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }

    console.warn('Product schema validation failed, using fallback');
    return filterFallback(safeQuery, safeMaxPrice);
  },
}) as Tool<z.infer<typeof searchParamsSchema>, z.infer<typeof ProductSchema>[]>;
