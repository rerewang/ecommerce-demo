export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'completed'

// Database structure (matches 'returns' table)
export interface DatabaseReturn {
  id: string
  order_id: string
  user_id: string
  status: ReturnStatus
  reason: string
  created_at: string
  updated_at: string
}

// Frontend view model
export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  status: ReturnStatus
  reason: string
  createdAt: string
  updatedAt: string
}
