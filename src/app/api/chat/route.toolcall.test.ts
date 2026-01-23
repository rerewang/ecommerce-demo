import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: vi.fn(() => 'mock-model'),
  },
}));

vi.mock('@/lib/ai/tools', () => ({
  searchProducts: {
    description: 'mock search',
    parameters: {},
    execute: vi.fn(),
  },
  trackOrder: {
    description: 'mock track',
    parameters: {},
    execute: vi.fn(),
  },
  checkReturnEligibility: {
    description: 'mock return',
    parameters: {},
    execute: vi.fn(),
  },
  createAlert: {
    description: 'mock alert',
    parameters: {},
    execute: vi.fn(),
  },
  listUserOrders: {
    description: 'mock list orders',
    parameters: {},
    execute: vi.fn(),
  },
}));

let capturedAgentOptions: unknown;

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  const createResponse = vi.fn(() => new Response('mock-stream'));
  class ToolLoopAgentMock {
    stream = vi.fn();
    constructor(options: { instructions?: string }) {
      capturedAgentOptions = options;
    }
  }
  return {
    ...actual,
    ToolLoopAgent: ToolLoopAgentMock,
    createAgentUIStreamResponse: createResponse,
  };
});

import { POST } from './route';

describe('POST /api/chat tool calling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAgentOptions = undefined;
  });

  it('should keep system prompt clean without server-side product injection', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'find oil paintings under 100' }],
      }),
    });

    await POST(req);

    const opts = capturedAgentOptions as { instructions?: string };
    expect(opts).toBeTruthy();
    expect(opts.instructions).toBeDefined();
    expect(String(opts.instructions)).not.toContain(':::products');
    expect(String(opts.instructions).trim()).toBe(SYSTEM_PROMPT.trim());
  });
});
