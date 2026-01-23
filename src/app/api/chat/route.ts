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

  // Normalize incoming messages
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

  // Server-side search to guarantee product data
  const lastUserMessage = [...normalizedMessages].reverse().find((m) => m.role === 'user')?.content || '';
  const parseMaxPrice = (text: string): number | undefined => {
    const match = text.match(/\b(\d+(?:\.\d+)?)\b/);
    if (!match) return undefined;
    const num = Number(match[1]);
    return Number.isFinite(num) ? num : undefined;
  };
  const query = lastUserMessage || 'oil painting';
  const maxPrice = parseMaxPrice(lastUserMessage) ?? 120;
  const products = (await searchProducts.execute?.({ query, maxPrice }, { toolCallId: 'server-side', messages: normalizedMessages })) ?? [];
  const productsJson = JSON.stringify(products);

  const systemPrompt = `${SYSTEM_PROMPT}
CONTEXT:
I have already searched for products matching the user's request.
Found Products: ${productsJson}

INSTRUCTIONS:
1. Summarize the products found in 1-2 sentences.
2. If no products were found, suggest alternatives.
3. CRITICAL: You MUST append the following block to the VERY END of your response (hidden from user, used for rendering):
:::products ${productsJson} :::
`;

  console.log('Sending messages to model:', JSON.stringify(normalizedMessages, null, 2));

  return streamText({
    model: openai.chat(process.env.AI_MODEL_NAME || 'deepseek-ai/DeepSeek-V3'),
    system: systemPrompt,
    messages: normalizedMessages,
    temperature: 0,
  }).toUIMessageStreamResponse();
}
