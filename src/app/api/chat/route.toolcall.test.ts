import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Mock dependencies
vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: vi.fn(() => 'mock-model'),
  },
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

let capturedAgentOptions: unknown;

// Mock ai SDK
const mocks = vi.hoisted(() => ({
  createAgentUIStreamResponse: vi.fn(() => new Response('mock-stream')),
}));

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  class ToolLoopAgentMock {
    stream = vi.fn();
    constructor(options: { instructions?: string }) {
      capturedAgentOptions = options;
    }
  }
  return {
    ...actual,
    ToolLoopAgent: ToolLoopAgentMock,
    createAgentUIStreamResponse: mocks.createAgentUIStreamResponse,
    convertToModelMessages: vi.fn((msgs) => msgs), // Identity for simple test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tool: (t: any) => t, // Passthrough helper
  };
});

import { POST } from './route';

describe('POST /api/chat tool calling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAgentOptions = undefined;
  });

  it('should call ToolLoopAgent with correct system prompt and tools', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'find oil paintings under 100' }],
      }),
    });

    await POST(req);

    const opts = capturedAgentOptions as { instructions?: string, tools?: Record<string, unknown> };
    expect(opts).toBeTruthy();
    expect(opts.instructions).toBe(SYSTEM_PROMPT);
    
    // Check tools are present
    expect(opts.tools).toBeDefined();
    expect(opts.tools).toHaveProperty('searchProducts');
    expect(opts.tools).toHaveProperty('trackOrder');
  });
});
