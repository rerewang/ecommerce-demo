import { randomUUID } from 'crypto';
import { openai } from '@/lib/ai/openai';
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs, type UIMessage } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import {
  searchProducts,
  trackOrder,
  checkReturnEligibility,
  createAlert,
  listUserOrders,
} from '@/lib/ai/tools';

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
  const rawMessages: UIMessage[] | IncomingMessage[] = Array.isArray(body?.messages)
    ? body.messages
    : [];

  const normalizedMessages: UIMessage[] = rawMessages.map((m) => {
    if (Array.isArray((m as UIMessage).parts)) {
      return m as UIMessage;
    }

    const content = typeof (m as IncomingMessage)?.content === 'string' ? (m as IncomingMessage).content : '';
    return {
      id: randomUUID(),
      role: (m as IncomingMessage)?.role ?? 'user',
      parts: [{ type: 'text', text: content || '' }],
    } as UIMessage;
  });

  console.log('Sending messages to model:', JSON.stringify(normalizedMessages, null, 2));

  const agent = new ToolLoopAgent({
    model: openai.chat(process.env.AI_MODEL_NAME || 'deepseek-ai/DeepSeek-V3'),
    instructions: SYSTEM_PROMPT,
    temperature: 0,
    toolChoice: 'auto',
    stopWhen: stepCountIs(5),
    tools: {
      searchProducts,
      trackOrder,
      checkReturnEligibility,
      createAlert,
      listUserOrders,
    },
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: normalizedMessages,
    onStepFinish: (step) => {
      // Ensure tool results surface as UI parts for frontend cards.
      const hasToolResults = step.toolResults && step.toolResults.length > 0;
      if (!hasToolResults) return;

      // Append tool-result parts to the last assistant message in-place
      const last = normalizedMessages[normalizedMessages.length - 1];
      if (!last || last.role !== 'assistant') {
        return;
      }

      const parts = Array.isArray((last as UIMessage).parts) ? [...(last as UIMessage).parts] : [];
      step.toolResults.forEach((tr) => {
        const anyResult = tr as { toolName?: string; toolCallId?: string; result?: unknown; output?: unknown; data?: unknown };
        const toolName = anyResult.toolName || 'unknown';
        const toolCallId = anyResult.toolCallId || randomUUID();
        const result = anyResult.result ?? anyResult.output ?? anyResult.data;
        parts.push({
          // the UI renderer expects a tool-result part carrying the payload
          type: 'tool-result' as const,
          toolName,
          toolCallId,
          result,
          state: 'result',
          input: undefined,
        } as unknown as UIMessage['parts'][number]);
      });

      (last as UIMessage).parts = parts;
    },
  });
}
