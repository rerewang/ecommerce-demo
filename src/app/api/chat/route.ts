import { randomUUID } from 'crypto';
import { openai } from '@/lib/ai/openai';
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs, type UIMessage } from 'ai';
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

  // 1. Initialize Supabase client with cookies
  const supabase = await createServerClient();
  
  // 2. Get current user
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

  // 3. Prepare context
  const toolContext = {
    supabase,
    user: user ? { id: user.id, role } : null
  };

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
      createReturnTicket,
      createAlert,
      listUserOrders,
    },
    // Inject context into all tool executions
    // @ts-ignore - The AI SDK types might not strictly support this, but it works at runtime or via custom adapter logic if we were using it.
    // WAIT: ToolLoopAgent from 'ai' package doesn't support 'context' property directly in constructor for tool execution.
    // We need to check how Vercel AI SDK handles context injection.
    // Actually, the `tools` definitions are static.
    // The `execute` function receives `options`. We need to pass context there.
    // But `ToolLoopAgent` doesn't seem to expose a way to pass per-request context to tools easily.
    
    // CORRECT APPROACH: 
    // We need to wrap the tools to inject context, OR use the `experimental_tool` with context if available.
    // However, since we defined tools using `tool()`, we can't easily curry them here without losing type inference?
    // Actually, we can just mutate the options object if we had access to the runner...
    
    // Let's use a wrapper function for tools or rebuild the agent options.
  });

  // WORKAROUND: Since we can't pass context directly to ToolLoopAgent constructor to be forwarded to tools (it's not in the standard API),
  // We need to re-bind the tools with context.
  
  const toolsWithContext = {
    searchProducts, // Doesn't need context
    trackOrder: { ...trackOrder, execute: (args: any, options: any) => trackOrder.execute!(args, { ...options, context: toolContext }) },
    checkReturnEligibility: { ...checkReturnEligibility, execute: (args: any, options: any) => checkReturnEligibility.execute!(args, { ...options, context: toolContext }) },
    createReturnTicket: { ...createReturnTicket, execute: (args: any, options: any) => createReturnTicket.execute!(args, { ...options, context: toolContext }) },
    createAlert: { ...createAlert, execute: (args: any, options: any) => createAlert.execute!(args, { ...options, context: toolContext }) },
    listUserOrders: { ...listUserOrders, execute: (args: any, options: any) => listUserOrders.execute!(args, { ...options, context: toolContext }) },
  };

  // Re-create agent with bound tools
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
      // DEBUG LOGGING
      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log('[Chatbot Debug] Tool Calls:', JSON.stringify(step.toolCalls, null, 2));
      }
      if (step.toolResults && step.toolResults.length > 0) {
        console.log('[Chatbot Debug] Tool Results:', JSON.stringify(step.toolResults, null, 2));
      }

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
