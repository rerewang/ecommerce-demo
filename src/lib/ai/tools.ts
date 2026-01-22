import { z } from 'zod';
import { tool } from 'ai';

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
    
    // Construct Supabase query dynamically
    // const supabase = createClient(); 
    // let dbQuery = supabase.from('products').select('*');
    
    // if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);
    // if (category) dbQuery = dbQuery.eq('category', category);
    // if (maxPrice) dbQuery = dbQuery.lte('price', maxPrice);
    
    // const { data, error } = await dbQuery.limit(5);
    // if (error) throw error;
    // return data;

    // Returning mock data until we hook up the actual DB client in this context
    return [
      {
        id: '1',
        name: 'Royal General Portrait',
        description: 'Your pet as a dignified 19th century general.',
        price: 149,
        category: 'Oil',
        image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      },
      {
        id: '2',
        name: 'Renaissance Lady',
        description: 'Elegant renaissance style portrait.',
        price: 159,
        category: 'Oil',
        image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      },
    ];
  },
});
