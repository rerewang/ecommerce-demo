import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Mock dependencies
vi.mock('@/lib/ai/openai', () => ({
  openai: vi.fn(() => ({ modelId: 'mock-model', provider: 'openai' })),
}));

vi.mock('@/lib/supabase-server', () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

// Mock tools with minimal structure
vi.mock('@/lib/ai/tools', () => ({
  searchProducts: { description: 'search', parameters: {}, execute: vi.fn() },
  trackOrder: { description: 'track', parameters: {}, execute: vi.fn() },
  checkReturnEligibility: { description: 'return', parameters: {}, execute: vi.fn() },
  createReturnTicket: { description: 'ticket', parameters: {}, execute: vi.fn() },
  createAlert: { description: 'alert', parameters: {}, execute: vi.fn() },
  listUserOrders: { description: 'list', parameters: {}, execute: vi.fn() },
}));

// Mock ai SDK
const mocks = vi.hoisted(() => ({
  streamText: vi.fn().mockResolvedValue({
    toDataStreamResponse: vi.fn(() => new Response('mock-stream')),
  }),
}));

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  return {
    ...actual,
    streamText: mocks.streamText,
    convertToModelMessages: vi.fn((msgs) => msgs), // Identity for simple test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tool: (t: any) => t, // Passthrough helper
  };
});

import { POST } from './route';

describe('POST /api/chat tool calling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call streamText with correct system prompt and tools', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'find oil paintings under 100' }],
      }),
    });

    await POST(req);

    expect(mocks.streamText).toHaveBeenCalled();
    const callArgs = mocks.streamText.mock.calls[0][0];
    
    // Check system prompt
    expect(callArgs.system).toBe(SYSTEM_PROMPT);
    
    // Check tools are present
    expect(callArgs.tools).toBeDefined();
    expect(callArgs.tools).toHaveProperty('searchProducts');
    expect(callArgs.tools).toHaveProperty('trackOrder');
    
    // Check model
    expect(callArgs.model).toEqual({ modelId: 'mock-model', provider: 'openai' });
  });
});
