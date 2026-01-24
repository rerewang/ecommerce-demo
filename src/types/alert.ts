export type AlertType = 'price_drop' | 'restock'
export type AlertStatus = 'active' | 'triggered' | 'cancelled'

// Database structure (matches 'product_alerts' table)
export interface DatabaseAlert {
  id: string
  user_id: string
  product_id: string
  type: AlertType
  target_price: number | null
  status: AlertStatus
  created_at: string
}

// Frontend view model
export interface ProductAlert {
  id: string
  userId: string
  productId: string
  type: AlertType
  targetPrice?: number
  status: AlertStatus
  createdAt: string
}
