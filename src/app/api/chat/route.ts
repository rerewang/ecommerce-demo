import { openai } from '@/lib/ai/openai';
import { streamText } from 'ai';
import { searchProducts } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

type IncomingPart = { type: 'text'; text: string };
type IncomingMessage = {
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: IncomingPart[];
};

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const rawMessages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];

  // Normalize incoming messages (supports either `content` string or `parts` array)
  const normalizedMessages = rawMessages.map((m) => {
    let content = '';
    if (typeof m?.content === 'string') {
      content = m.content;
    } else if (Array.isArray(m?.parts)) {
      content = m.parts
        .filter((p) => p?.type === 'text' && typeof p.text === 'string')
        .map((p) => p.text)
        .join('');
    }
    return {
      role: m?.role ?? 'user',
      content,
    };
  });

  // Extract last user message text for fallback tool arguments
  const lastUserMessage = [...normalizedMessages].reverse().find((m) => m.role === 'user')?.content || '';

  // Fallback wrapper: if model omits query/maxPrice, derive from user text
  const parseMaxPrice = (text: string): number | undefined => {
    const match = text.match(/\b(\d+(?:\.\d+)?)\b/);
    if (!match) return undefined;
    const num = Number(match[1]);
    return Number.isFinite(num) ? num : undefined;
  };

  const searchProductsWithFallback = {
    ...searchProducts,
    execute: async (args: { query?: string; category?: string; maxPrice?: number } = {}) => {
      const fallbackQuery = lastUserMessage || args.query || '';
      const fallbackMaxPrice =
        typeof args.maxPrice === 'number' ? args.maxPrice : parseMaxPrice(lastUserMessage) ?? 120;
      const mergedArgs = {
        ...args,
        query: args.query?.trim() || fallbackQuery || 'oil painting',
        maxPrice: fallbackMaxPrice,
      };
      return (
        await searchProducts.execute?.(mergedArgs, {
          toolCallId: 'fallback-search',
          messages: normalizedMessages,
        })
      ) ?? [];
    },
  };

  const result = streamText({
    model: openai.chat(process.env.AI_MODEL_NAME || 'deepseek-ai/DeepSeek-V3'),
    system: SYSTEM_PROMPT,
    messages: normalizedMessages,
    tools: {
      searchProducts: searchProductsWithFallback,
    },
    toolChoice: 'auto',
  });

  return result.toUIMessageStreamResponse();
}
