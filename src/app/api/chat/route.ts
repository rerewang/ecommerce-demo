import { openai } from '@/lib/ai/openai';
import { streamText } from 'ai';
import { searchProducts } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      searchProducts,
    },
    // maxSteps: 5, // Removed unsupported property
  });

  return result.toTextStreamResponse();
}
