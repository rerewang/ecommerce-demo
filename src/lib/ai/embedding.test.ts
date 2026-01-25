import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateEmbedding } from './embedding';

const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      embeddings = {
        create: mockCreate
      }
    }
  }
});

describe('generateEmbedding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SILICONFLOW_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.SILICONFLOW_API_KEY;
  });

  it('generates embedding for text input', async () => {
    // Arrange
    const mockEmbedding = Array(1024).fill(0.1);
    mockCreate.mockResolvedValueOnce({
      data: [{ embedding: mockEmbedding }]
    });

    // Act
    const result = await generateEmbedding('test text');

    // Assert
    expect(result).toEqual(mockEmbedding);
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'BAAI/bge-m3',
      input: 'test text',
      encoding_format: 'float'
    });
  });

  it('normalizes input text by removing newlines', async () => {
    // Arrange
    const mockEmbedding = Array(1024).fill(0.1);
    mockCreate.mockResolvedValueOnce({
      data: [{ embedding: mockEmbedding }]
    });

    // Act
    await generateEmbedding('line 1\nline 2');

    // Assert
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      input: 'line 1 line 2'
    }));
  });

  it('handles empty input gracefully', async () => {
    // Act
    const result = await generateEmbedding('');
    
    // Assert
    expect(result).toHaveLength(1024);
    expect(result[0]).toBe(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });
  
  it('returns zero vector when API fails (resilience)', async () => {
      // Arrange
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      // Act
      const result = await generateEmbedding('test');

      // Assert
      expect(result).toHaveLength(1024);
      expect(result.every(v => v === 0)).toBe(true);
  });
});
