import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductInput, UpdateProductInput } from '@/types/product';

// Mocks
const mocks = vi.hoisted(() => {
  return {
    generateEmbedding: vi.fn(),
    cookies: vi.fn(),
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    },
    notifications: {
      checkAlertsForProduct: vi.fn()
    }
  };
});

// Mock dependencies
vi.mock('@/services/notifications', () => ({
  checkAlertsForProduct: mocks.notifications.checkAlertsForProduct
}));

vi.mock('@/lib/ai/embedding', () => ({
  generateEmbedding: mocks.generateEmbedding
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mocks.supabase
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies
}));

// Import actions (after mocking)
import { createProductAction, updateProductAction, searchSemanticProductsAction } from './product-actions';

describe('Product Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Supabase chain mocks
    const mockSelect = vi.fn().mockReturnThis();
    const mockInsert = vi.fn().mockReturnThis();
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn();
    
    mocks.supabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      single: mockSingle
    });
    
    // Default success for single()
    mockSingle.mockResolvedValue({ 
      data: { id: '1', name: 'Test Product', price: 100, stock: 10 }, 
      error: null 
    });
    
    // Default success for rpc
    mocks.supabase.rpc.mockResolvedValue({ data: [], error: null });
  });

  describe('createProductAction', () => {
    it('generates embedding and inserts product', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Art',
        image_url: 'http://example.com/image.jpg',
        metadata: { features: { highlight: 'Test Features' } }
      };
      const mockEmbedding = [0.1, 0.2, 0.3];
      mocks.generateEmbedding.mockResolvedValue(mockEmbedding);

      // Act
      await createProductAction(input);

      // Assert
      expect(mocks.generateEmbedding).toHaveBeenCalledWith(
        'Test Product: Test Description {"highlight":"Test Features"}'
      );
      expect(mocks.supabase.from).toHaveBeenCalledWith('products');
      // Verify insert was called with embedding
      const insertCall = mocks.supabase.from().insert.mock.calls[0][0];
      expect(insertCall).toMatchObject({
        ...input,
        embedding: mockEmbedding
      });
    });
  });

  describe('updateProductAction', () => {
    it('generates new embedding and updates product', async () => {
      // Arrange
      const id = '1';
      const input: UpdateProductInput = {
        name: 'Updated Product',
        description: 'Updated Description'
      };
      const mockEmbedding = [0.4, 0.5, 0.6];
      mocks.generateEmbedding.mockResolvedValue(mockEmbedding);

      // Act
      await updateProductAction(id, input);

      // Assert
      expect(mocks.generateEmbedding).toHaveBeenCalledWith(
        expect.stringContaining('Updated Product')
      );
      
      const updateCall = mocks.supabase.from().update.mock.calls[0][0];
      expect(updateCall).toMatchObject({
        ...input,
        embedding: mockEmbedding
      });
    });
  });

  describe('searchSemanticProductsAction', () => {
    it('generates embedding and calls RPC', async () => {
      // Arrange
      const query = 'cozy art';
      const mockEmbedding = [0.7, 0.8, 0.9];
      mocks.generateEmbedding.mockResolvedValue(mockEmbedding);

      // Act
      await searchSemanticProductsAction(query);

      // Assert
      expect(mocks.generateEmbedding).toHaveBeenCalledWith(query);
      expect(mocks.supabase.rpc).toHaveBeenCalledWith('match_products', {
        query_embedding: mockEmbedding,
        match_threshold: 0.5,
        match_count: 10
      });
    });
  });
});
