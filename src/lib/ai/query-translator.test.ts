import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { translateQuery } from './query-translator';
import { generateText } from 'ai';

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

describe('translateQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should translate Chinese query to English optimized for search', async () => {
    (generateText as Mock).mockResolvedValue({
      text: 'iPhone smartphone',
    });

    const result = await translateQuery('苹果手机');
    expect(result).toBe('iPhone smartphone');
    expect(generateText).toHaveBeenCalledTimes(1);
    const callArgs = (generateText as Mock).mock.calls[0][0];
    expect(callArgs.system).toContain('translate');
    expect(callArgs.prompt).toBe('苹果手机');
  });

  it('should optimize English query', async () => {
    (generateText as Mock).mockResolvedValue({
      text: 'affordable oil painting',
    });

    const result = await translateQuery('cheap oil painting');
    expect(result).toBe('affordable oil painting');
  });

  it('should return original query if API fails', async () => {
    (generateText as Mock).mockRejectedValue(new Error('API Error'));

    const result = await translateQuery('test query');
    expect(result).toBe('test query');
  });

  it('should handle empty query', async () => {
    const result = await translateQuery('');
    expect(result).toBe('');
    expect(generateText).not.toHaveBeenCalled();
  });
});
