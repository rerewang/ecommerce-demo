import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: vi.fn(),
  },
}));

vi.mock('@/lib/ai/tools', () => ({
  searchProducts: {
    description: 'mock search',
    parameters: {},
    execute: vi.fn(),
  },
}));

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  return {
    ...actual,
    streamText: vi.fn(),
  };
});

describe('POST /api/chat tool calling', () => {
  let mockStreamText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const ai = await import('ai');
    mockStreamText = vi.mocked(ai.streamText);
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('mock-stream'),
    });
  });

  it('should inject search results into system prompt (products block present)', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'find oil paintings under 100' }],
      }),
    });

    await POST(req);

    const args = mockStreamText.mock.calls[0][0];
    expect(args.system).toContain(':::products');
  });
});
