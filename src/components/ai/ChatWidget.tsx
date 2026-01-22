'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { UIMessage } from 'ai';
import { useDebouncedCallback } from 'use-debounce';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
};

type ToolInvocation = {
  toolName?: string;
  toolCallId?: string;
  result?: Product[];
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, status, error: chatError, stop, regenerate, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const displayError = error ?? (typeof chatError === 'string' ? chatError : chatError?.message ?? null);

  const isLoading = status === 'streaming' || status === 'submitted';
  const canStop = status === 'streaming';
  const canRegenerate = !isLoading && messages.length > 0;

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('petpixel-chat-messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed as UIMessage[]);
        }
      }
    } catch (err) {
      console.error('load messages failed', err);
    }
  }, [setMessages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('petpixel-chat-messages', JSON.stringify(messages));
    } catch (err) {
      console.error('save messages failed', err);
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleDebouncedSubmit = useDebouncedCallback(() => {
    if (!input.trim()) return;
    void handleSubmit();
  }, 200);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    try {
      setError(null);
      setLastSent(input);
      await sendMessage({ text: input });
    } catch (err) {
      console.error('sendMessage error', err);
      setError('Request failed. Tap retry to send again.');
    } finally {
      setInput('');
    }
  };

  const handleRetry = async () => {
    const text = lastSent || input;
    if (!text.trim()) return;
    try {
      setError(null);
      await sendMessage({ text });
    } catch (err) {
      console.error('retry error', err);
      setError('Retry failed. Please check your network and try again.');
    }
  };

  const handleStop = () => {
    try {
      stop();
    } catch (err) {
      console.error('stop error', err);
      setError('Stop failed.');
    }
  };

  const handleRegenerate = async () => {
    try {
      setError(null);
      await regenerate();
    } catch (err) {
      console.error('regenerate error', err);
      setError('Regenerate failed.');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] pointer-events-auto shadow-xl rounded-2xl overflow-hidden bg-white border border-stone-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">PetPixel Art Curator</h3>
                  <p className="text-xs text-stone-500">Premium AI Assistant</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full hover:bg-stone-100"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4 text-stone-500" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {displayError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center justify-between gap-2">
                  <span>{displayError}</span>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              )}

              {messages.length === 0 && (
                <div className="text-center py-8 text-stone-500">
                  <p className="text-sm">Welcome! I can help you find the perfect art style for your pet.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button 
                      onClick={() => setInput('Find oil paintings under $200')}
                      className="text-xs bg-white border border-stone-200 rounded-full px-3 py-2 hover:bg-stone-50 transition-colors"
                    >
                      &quot;Find oil paintings under $200&quot;
                    </button>
                    <button 
                      onClick={() => setInput('Show me something royal')}
                      className="text-xs bg-white border border-stone-200 rounded-full px-3 py-2 hover:bg-stone-50 transition-colors"
                    >
                      &quot;Show me something royal&quot;
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((m: UIMessage & { content?: string; parts?: { type?: string; text?: string }[]; toolInvocations?: ToolInvocation[] }) => {
                const parts = m.parts;
                let content = typeof m.content === 'string'
                  ? m.content
                  : parts
                      ?.filter((p) => p?.type === 'text' && typeof (p as { text?: string }).text === 'string')
                      .map((p) => (p as { text?: string }).text || '')
                      .join('') || '';

                // Check for embedded products from server-side injection
                let embeddedProducts: Product[] = [];
                // Regex matches :::products [json] ::: across lines
                const productsMatch = content.match(/:::products\s+(\[[\s\S]*?\])\s+:::/);
                if (productsMatch) {
                  try {
                    embeddedProducts = JSON.parse(productsMatch[1]);
                    content = content.replace(productsMatch[0], '').trim();
                  } catch (e) {
                    console.error('Failed to parse embedded products', e);
                  }
                }

                const invocationsToRender = [...(m.toolInvocations || [])];
                if (embeddedProducts.length > 0) {
                  invocationsToRender.push({
                    toolName: 'searchProducts',
                    toolCallId: `embedded-${m.id}`,
                    result: embeddedProducts,
                  });
                }

                return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${m.role === 'user' ? 'bg-stone-200' : 'bg-primary/10'}
                  `}>
                    {m.role === 'user' ? <UserIcon className="w-4 h-4 text-stone-600" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  
                  <div className={`
                    max-w-[80%] rounded-2xl px-4 py-3 text-sm overflow-hidden
                    ${m.role === 'user' 
                      ? 'bg-stone-900 text-white rounded-tr-sm' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'
                    }
                  `}>
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words">{content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-stone-800 prose-p:leading-relaxed prose-pre:bg-stone-100 prose-pre:p-2 prose-pre:rounded-lg break-words">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Render tool invocations if any (simplified) */}
                    {invocationsToRender.map((toolInvocation) => {
                      if (toolInvocation.toolName === 'searchProducts' && toolInvocation.result) {
                        const products = toolInvocation.result as Product[];
                        const hasProducts = !!products && products.length > 0;
                        const showSummaryFallback = !content.trim() || !hasProducts;
                        return (
                          <div key={toolInvocation.toolCallId} className="mt-3 flex flex-col gap-2">
                            {showSummaryFallback && (
                              <div className="text-xs text-stone-500">
                                {hasProducts
                                  ? '以下是匹配的商品，如需调整预算或风格请告诉我。'
                                  : '未找到符合条件的商品，试试调整预算或关键词。'}
                              </div>
                            )}
                            {hasProducts && products.map((product) => (
                              <div key={product.id} className="bg-stone-50 p-2 rounded-lg border border-stone-100 flex gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md bg-stone-200" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate">{product.name}</div>
                                  <div className="text-primary font-bold text-xs">${product.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )})}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-stone-100">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about art styles..."
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!canStop}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    onClick={handleStop}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!canRegenerate}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                  onClick={handleRegenerate}
                  >
                    <Loader2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    disabled={isLoading || !input.trim()}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    onClick={() => handleDebouncedSubmit()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto h-14 w-14 rounded-full bg-stone-900 text-white shadow-lg flex items-center justify-center hover:bg-stone-800 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
