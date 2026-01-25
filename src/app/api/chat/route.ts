import { randomUUID } from 'crypto';
import { openai } from '@/lib/ai/openai';
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs, type UIMessage, type ToolExecutionOptions } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { createServerClient } from '@/lib/supabase-server';
import {
  searchProducts,
  trackOrder,
  checkReturnEligibility,
  createReturnTicket,
  createAlert,
  listUserOrders,
} from '@/lib/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  console.log('[Chatbot] Incoming body:', JSON.stringify(body));
  const rawMessages: UIMessage[] | { role?: 'user' | 'assistant' | 'system'; content?: string }[] = Array.isArray(body?.messages)
    ? body.messages
    : [];

  const normalizedMessages: UIMessage[] = rawMessages.map((m) => {
    if (Array.isArray((m as UIMessage).parts)) {
      return m as UIMessage;
    }

    const content = typeof (m as { content?: string })?.content === 'string' ? (m as { content?: string }).content : '';
    return {
      id: randomUUID(),
      role: (m as { role?: UIMessage['role'] })?.role ?? 'user',
      parts: [{ type: 'text', text: content || '' }],
    } as UIMessage;
  });

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = 'customer';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || 'customer';
  }

  const toolContext = {
    supabase,
    user: user ? { id: user.id, role } : null
  };

  type ContextToolOptions = ToolExecutionOptions & { context?: typeof toolContext };

  const toolsWithContext = {
    searchProducts,
    trackOrder: { ...trackOrder, execute: (args: unknown, options: ContextToolOptions) => trackOrder.execute!(args as never, { ...options, context: toolContext } as ContextToolOptions) },
    checkReturnEligibility: { ...checkReturnEligibility, execute: (args: unknown, options: ContextToolOptions) => checkReturnEligibility.execute!(args as never, { ...options, context: toolContext } as ContextToolOptions) },
    createReturnTicket: { ...createReturnTicket, execute: (args: unknown, options: ContextToolOptions) => createReturnTicket.execute!(args as never, { ...options, context: toolContext } as ContextToolOptions) },
    createAlert: { ...createAlert, execute: (args: unknown, options: ContextToolOptions) => createAlert.execute!(args as never, { ...options, context: toolContext } as ContextToolOptions) },
    listUserOrders: { ...listUserOrders, execute: (args: unknown, options: ContextToolOptions) => listUserOrders.execute!(args as never, { ...options, context: toolContext } as ContextToolOptions) },
  };

  const boundAgent = new ToolLoopAgent({
    model: openai.chat(process.env.AI_MODEL_NAME || 'deepseek-ai/DeepSeek-V3'),
    instructions: SYSTEM_PROMPT,
    temperature: 0,
    toolChoice: 'auto',
    stopWhen: stepCountIs(5),
    tools: toolsWithContext,
  });

  return createAgentUIStreamResponse({
    agent: boundAgent,
    uiMessages: normalizedMessages,
    onStepFinish: (step) => {
      console.log('[Chatbot Debug] Step finished:', {
        hasToolCalls: !!(step.toolCalls && step.toolCalls.length),
        toolCallsCount: step.toolCalls?.length ?? 0,
        hasToolResults: !!(step.toolResults && step.toolResults.length),
        toolResultsCount: step.toolResults?.length ?? 0,
      });
      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log('[Chatbot Debug] Tool Calls:', JSON.stringify(step.toolCalls, null, 2));
      }
      if (step.toolResults && step.toolResults.length > 0) {
        console.log('[Chatbot Debug] Tool Results:', JSON.stringify(step.toolResults, null, 2));
      }

      const hasToolResults = step.toolResults && step.toolResults.length > 0;
      if (!hasToolResults) return;

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
