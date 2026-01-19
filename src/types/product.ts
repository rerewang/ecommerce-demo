export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  category: string
  created_at: string
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>
export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductFilter {
  query?: string
  category?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
}
