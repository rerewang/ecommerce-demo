import { z } from 'zod';
import { tool, type Tool, type ToolExecutionOptions } from 'ai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getOrderById, getOrders, getUserOrders } from '@/services/orders';
import { checkReturnEligibility as checkEligibilityService, createReturnRequest } from '@/services/returns';
import { createAlert as createAlertService } from '@/services/alerts';
import { Order, OrderItemView } from '@/types/order';

type ToolContext = {
  supabase: SupabaseClient;
  user: { id: string; role?: string } | null;
}

// Extension to AI SDK type since we are injecting context
type ContextAwareToolExecutionOptions = ToolExecutionOptions & {
  context?: ToolContext;
};

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
  execute: async ({ orderId }, options) => {
    try {
      const context = (options as ContextAwareToolExecutionOptions).context;
      if (!context?.supabase || !context?.user) {
        return { error: 'Unauthorized: Please login to track orders.' };
      }

      // Direct service call instead of fetch
      const order = await getOrderById(orderId, context.supabase);
      
      if (!order) {
        return { error: 'Order not found' };
      }

      // Security check (redundant if RLS works, but good practice)
      if (context.user.role !== 'admin' && order.userId !== context.user.id) {
        return { error: 'Unauthorized: You can only view your own orders.' };
      }

      // Construct timeline (logic copied from status/route.ts)
      const events = [
        { label: 'Order Created', status: 'created', timestamp: order.createdAt },
      ];

      if (order.status === 'paid' || order.status === 'shipped') {
        events.push({ label: 'Payment Confirmed', status: 'paid', timestamp: order.updatedAt });
      }

      if (order.status === 'shipped') {
        events.push({ label: 'Shipped', status: 'shipped', timestamp: order.updatedAt });
      }

      if (order.status === 'cancelled') {
        events.push({ label: 'Cancelled', status: 'cancelled', timestamp: order.updatedAt });
      }

      return {
        orderId: order.id,
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        timeline: events,
      };
    } catch (e) {
      console.error('Track order tool error', e);
      return { error: 'System error while tracking order' };
    }
  },
});

export const checkReturnEligibilitySchema = z.object({
  orderId: z.string().describe('The Order ID to check for return eligibility'),
});

export const checkReturnEligibility = tool({
  description: 'Check if an order is eligible for return or exchange',
  inputSchema: checkReturnEligibilitySchema,
  execute: async ({ orderId }, options) => {
    try {
      const context = (options as ContextAwareToolExecutionOptions).context;
      if (!context?.supabase || !context?.user) {
        return { error: 'Unauthorized' };
      }

      const result = await checkEligibilityService(orderId, context.user.id, context.supabase);

      return {
        orderId,
        eligible: result.eligible,
        reason: result.reason,
        existingReturnId: result.existingReturnId,
        policy: { windowDays: 30 },
        daysSincePurchase: result.daysSincePurchase
      };
    } catch (e: any) {
      console.error('Return eligibility tool error', e);
      return { 
        orderId,
        eligible: false,
        reason: e.message || 'Could not verify eligibility (System Error)',
        policy: { windowDays: 30 }
      };
    }
  },
});

export const createReturnTicketSchema = z.object({
  orderId: z.string().describe('The Order ID to create a return ticket for'),
  reason: z.string().describe('Reason for the return'),
});

export const createReturnTicket = tool({
  description: 'Create a return ticket (request) for an eligible order',
  inputSchema: createReturnTicketSchema,
  execute: async ({ orderId, reason }, options) => {
    try {
      const context = (options as ContextAwareToolExecutionOptions).context;
      if (!context?.supabase || !context?.user) {
        return { error: 'Unauthorized' };
      }

      const returnRequest = await createReturnRequest(orderId, context.user.id, reason, context.supabase);
      
      return {
         ...returnRequest,
         message: 'Return ticket created successfully. Support will review it shortly.'
      };
    } catch (e: any) {
      console.error('Create return ticket tool error', e);
      return { error: e.message || 'Failed to create return ticket' };
    }
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
  execute: async ({ productId, type, targetPrice }, options) => {
    try {
      const context = (options as ContextAwareToolExecutionOptions).context;
      if (!context?.supabase || !context?.user) {
        return { error: 'Unauthorized' };
      }

      const newAlert = await createAlertService(context.user.id, productId, type, targetPrice, context.supabase);

      return {
        ...newAlert,
        message: 'Alert created successfully'
      };
    } catch (e: any) {
      console.error('Create alert tool error', e);
      return { error: e.message || 'System error while creating alert' };
    }
  },
});

export const listUserOrdersSchema = z.object({
  limit: z.number().int().min(1).max(10).optional().describe('How many recent orders to fetch (default 5, max 10)'),
});

export const listUserOrders = tool({
  description: 'List the most recent orders for the authenticated user (or admin)',
  inputSchema: listUserOrdersSchema,
  execute: async ({ limit }, options) => {
    try {
      const context = (options as ContextAwareToolExecutionOptions).context;
      if (!context?.supabase || !context?.user) {
        return { error: 'Unauthorized' };
      }

      // Use getUserOrders instead of getOrders to respect RBAC for customers
      // getOrders is strict admin-only
      const orders = await getUserOrders(
        context.user.id, 
        context.user.role || 'customer', 
        context.supabase
      );

      // Filter logic is inside getOrders service, but we might need to limit count manually if service doesn't support limit param
      // Note: getOrders service returns ALL orders. We should slice it.
      const limitedOrders = orders.slice(0, limit || 5);

      const formatted = limitedOrders.map((order: Order) => ({
        orderId: order.id,
        shortId: order.id.slice(0, 8),
        createdAt: order.createdAt,
        status: order.status,
        total: order.total,
        items: (order.items || []).slice(0, 2).map((item: OrderItemView) => ({
          id: item.id,
          name: item.product?.name ?? 'Unknown item',
          imageUrl: item.product?.image_url ?? '',
          quantity: item.quantity,
        })),
      }));

      return { orders: formatted };
    } catch (e) {
      console.error('List user orders tool error', e);
      return { error: 'System error while listing orders' };
    }
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

    // If Supabase not configured, or query empty, return empty
    if (!supabase) {
      return [];
    }

    let dbQuery = supabase.from('products').select('*');
    
    // Simple keyword search on name or description
    if (safeQuery) {
        dbQuery = dbQuery.or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`);
    }

    if (category) {
      dbQuery = dbQuery.ilike('category', `%${category}%`);
    }
    if (safeMaxPrice) {
      dbQuery = dbQuery.lte('price', safeMaxPrice);
    }

    const { data, error } = await dbQuery.limit(5);
    
    if (error) {
      console.error('Supabase search error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const parsed = ProductSchema.array().safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }

    console.warn('Product schema validation failed');
    return [];
  },
}) as Tool<z.infer<typeof searchParamsSchema>, z.infer<typeof ProductSchema>[]>;
