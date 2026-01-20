export interface ProductVariant {
  name: string // e.g., "Color"
  values: string[] // e.g., ["Red", "Blue"]
}

export interface ProductMetadata {
  features?: Record<string, string> // Key-value attributes e.g. { Material: "Cotton" }
  variants?: ProductVariant[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // Allow other arbitrary keys
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  category: string
  created_at: string
  metadata?: ProductMetadata
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>
export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductFilter {
  query?: string
  category?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
}
