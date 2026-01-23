'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Trash2, Maximize2, Minimize2, Copy, Check, Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { UIMessage } from 'ai';
import { useDebouncedCallback } from 'use-debounce';

import { OrderCard } from './cards/OrderCard';
import { ReturnCard } from './cards/ReturnCard';
import { AlertCard } from './cards/AlertCard';

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
  result?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { messages, sendMessage, status, error: chatError, stop, regenerate, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const displayError = error ?? (typeof chatError === 'string' ? chatError : chatError?.message ?? null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    const safeInput = typeof input === 'string' ? input : '';
    if (!safeInput.trim()) return;
    void handleSubmit();
  }, 200);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const safeInput = typeof input === 'string' ? input : '';
    if (!safeInput.trim()) return;
    if (isOffline) {
      setError('You are offline. Please check your connection.');
      return;
    }
    try {
      setError(null);
      setLastSent(safeInput);
      await sendMessage({ text: safeInput });
    } catch (err) {
      console.error('sendMessage error', err);
      setError('Request failed. Tap retry to send again.');
    } finally {
      setInput('');
    }
  };

  const handleRetry = async () => {
    const raw = lastSent || input;
    const text = typeof raw === 'string' ? raw : '';
    if (!text.trim()) return;
    if (isOffline) {
      setError('You are offline. Please check your connection.');
      return;
    }
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

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
      setInput('');
      setError(null);
      setLastSent('');
      try {
        window.localStorage.removeItem('petpixel-chat-messages');
      } catch (e) {
        console.error('clear storage error', e);
      }
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const safeInputValue = typeof input === 'string' ? input : '';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isExpanded ? '800px' : '350px',
              height: isExpanded ? '80vh' : '500px',
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 pointer-events-auto shadow-xl rounded-2xl overflow-hidden bg-white border border-stone-200 flex flex-col ${isExpanded ? 'max-w-[calc(100vw-48px)]' : 'sm:w-[400px]'}`}
          >
            {/* Header */}
            <div className="bg-white p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">PetPixel Art Curator</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-stone-500">Premium AI Assistant</p>
                    {isOffline && (
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full border border-stone-200">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-stone-100 text-stone-500"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-stone-100 text-stone-500 hover:text-red-500"
                  onClick={handleClear}
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-stone-100"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4 text-stone-500" />
                </Button>
              </div>
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
                      Find oil paintings under $200
                    </button>
                    <button 
                      onClick={() => setInput('Show me something royal')}
                      className="text-xs bg-white border border-stone-200 rounded-full px-3 py-2 hover:bg-stone-50 transition-colors"
                    >
                      Show me something royal
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((m: UIMessage & { content?: string; parts?: { type?: string; text?: string; toolName?: string; result?: unknown }[]; toolInvocations?: ToolInvocation[] }, idx) => {
                const parts = Array.isArray(m.parts) ? m.parts : [];
                const textParts = parts as Array<{ type?: string; text?: string }>;
                const textFromParts = textParts
                  .filter((p) => p?.type === 'text' && typeof p.text === 'string')
                  .map((p) => p.text || '')
                  .join('');
                const fallbackContent = typeof m.content === 'string' ? m.content : '';
                const content = textFromParts || fallbackContent;

                // Check for embedded products from server-side injection (legacy safeguard)
                let embeddedProducts: Product[] = [];
                let displayContent = content;

                const productsMatch = content.match(/:::products\s*(\[[\s\S]*?\])\s*:::/);
                if (productsMatch) {
                  try {
                    embeddedProducts = JSON.parse(productsMatch[1]);
                    displayContent = content.replace(productsMatch[0], '').trim();
                  } catch (e) {
                    console.error('Failed to parse embedded products', e);
                  }
                } else if (content.includes(':::products')) {
                  const chunks = content.split(':::products');
                  displayContent = chunks[0].trim();
                }

                type ToolResultPart = { type?: string; toolName?: string; toolCallId?: string; result?: unknown };
                const toolResults: Array<{ toolName: string; toolCallId?: string; result: unknown }> = (parts as ToolResultPart[])
                  .filter((p) => p?.type === 'tool-result' && typeof p.toolName === 'string')
                  .map((p) => ({
                    toolName: p.toolName as string,
                    toolCallId: p.toolCallId,
                    result: p.result,
                  }));

                // Handle provider-specific tool parts (e.g., type: "tool-searchProducts" with output)
                const providerToolResults: Array<{ toolName: string; toolCallId?: string; result: unknown }> = parts
                  .filter((p) => {
                    const pt = p as { type?: string; state?: string; output?: unknown; result?: unknown };
                    return (
                      typeof pt.type === 'string' &&
                      pt.type.startsWith('tool-') &&
                      (pt.state === 'output-available' || pt.state === 'result') &&
                      (pt.output !== undefined || pt.result !== undefined)
                    );
                  })
                  .map((p) => {
                    const typed = p as { type: string; toolCallId?: string; output?: unknown; result?: unknown };
                    return {
                      toolName: typed.type.replace(/^tool-/, '') || 'unknown',
                      toolCallId: typed.toolCallId,
                      result: typed.output ?? typed.result,
                    };
                  });

                const invocationsToRender = [
                  ...(m.toolInvocations || []),
                  ...toolResults.map((tr) => ({
                    toolName: tr.toolName,
                    toolCallId: tr.toolCallId,
                    result: tr.result,
                  })),
                  ...providerToolResults.map((tr) => ({
                    toolName: tr.toolName,
                    toolCallId: tr.toolCallId,
                    result: tr.result,
                  })),
                ];

                if (embeddedProducts.length > 0) {
                  toolResults.push({
                    toolName: 'searchProducts',
                    toolCallId: `embedded-${m.id}`,
                    result: embeddedProducts,
                  });
                }

                return (
                <div
                  key={`${m.id}-${idx}`}
                  className={`flex gap-3 group ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${m.role === 'user' ? 'bg-stone-200' : 'bg-primary/10'}
                 `}>
                    {m.role === 'user' ? <UserIcon className="w-4 h-4 text-stone-600" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  
                  <div className={`
                    max-w-[80%] rounded-2xl px-4 py-3 text-sm overflow-hidden relative
                    ${m.role === 'user' 
                      ? 'bg-stone-900 text-white rounded-tr-sm' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm'
                    }
                 `}>
                    {m.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${copiedId === m.id ? 'opacity-100 text-green-500' : 'text-stone-400 hover:text-stone-600'}`}
                        onClick={() => handleCopy(m.id, displayContent)}
                        title="Copy message"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    )}

                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap break-words">{content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-stone-800 prose-p:leading-relaxed prose-pre:bg-stone-100 prose-pre:p-2 prose-pre:rounded-lg break-words">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {displayContent}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                     {/* Render tool results if any (simplified) */}
                     {invocationsToRender.map((toolInvocation) => {
                       if (toolInvocation.toolName === 'searchProducts' && toolInvocation.result) {
                         const products = toolInvocation.result as Product[];
                        const hasProducts = !!products && products.length > 0;
                        const showSummaryFallback = !displayContent.trim() || !hasProducts;
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
                                <img 
                                  src={product.image_url || '/placeholder-image.jpg'} 
                                  alt={product.name} 
                                  className="w-12 h-12 object-cover rounded-md bg-stone-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23d6d3d1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate">{product.name}</div>
                                  <div className="text-primary font-bold text-xs">${product.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      if (toolInvocation.toolName === 'trackOrder' && toolInvocation.result) {
                        return (
                          <div key={toolInvocation.toolCallId} className="mt-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <OrderCard data={toolInvocation.result as any} />
                          </div>
                        );
                      }

                      if (toolInvocation.toolName === 'checkReturnEligibility' && toolInvocation.result) {
                        return (
                          <div key={toolInvocation.toolCallId} className="mt-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <ReturnCard data={toolInvocation.result as any} />
                          </div>
                        );
                      }

                      if (toolInvocation.toolName === 'createAlert' && toolInvocation.result) {
                        return (
                          <div key={toolInvocation.toolCallId} className="mt-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <AlertCard data={toolInvocation.result as any} />
                          </div>
                        );
                      }

                      if (toolInvocation.toolName === 'listUserOrders' && toolInvocation.result) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { orders } = toolInvocation.result as { orders: any[] };
                        const hasOrders = orders && orders.length > 0;

                        if (!hasOrders) {
                          return (
                            <div key={toolInvocation.toolCallId} className="mt-3 text-xs text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100 flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-stone-400" />
                              <span>No recent orders found.</span>
                            </div>
                          );
                        }

                        return (
                          <div key={toolInvocation.toolCallId} className="mt-3 flex flex-col gap-2">
                            <div className="text-xs text-stone-500 mb-1">Select an order to view details:</div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {orders.map((order: any) => (
                              <button
                                key={order.orderId}
                                onClick={() => sendMessage({ text: `Show details for order ${order.shortId}` })}
                                className="flex flex-col text-left bg-white border border-stone-200 rounded-lg p-3 hover:border-primary/50 hover:shadow-sm transition-all group/order w-full"
                              >
                                <div className="flex justify-between items-start w-full mb-2">
                                  <div className="flex items-center gap-2">
                                     <div className="bg-stone-50 p-1.5 rounded-md border border-stone-100">
                                       <Package className="w-3.5 h-3.5 text-stone-500" />
                                     </div>
                                     <div>
                                       <div className="font-medium text-sm text-stone-900">Order #{order.shortId}</div>
                                       <div className="text-[10px] text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                     </div>
                                  </div>
                                  <div className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                    order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-stone-100 text-stone-600 border-stone-200'
                                  }`}>
                                    {order.status}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 pl-[38px] w-full">
                                   {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                   {order.items?.slice(0, 3).map((item: any, i: number) => (
                                     <div key={i} className="relative w-8 h-8 bg-stone-50 rounded border border-stone-100 overflow-hidden shrink-0" title={`${item.name} (x${item.quantity})`}>
                                       {item.imageUrl ? (
                                         // eslint-disable-next-line @next/next/no-img-element
                                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                       ) : (
                                         <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">?</div>
                                       )}
                                       {item.quantity > 1 && (
                                          <div className="absolute bottom-0 right-0 bg-stone-900/80 text-white text-[8px] px-0.5 rounded-tl-sm leading-none">
                                            {item.quantity}
                                          </div>
                                       )}
                                     </div>
                                   ))}
                                </div>
                                
                                <div className="flex justify-between items-center w-full mt-2 pl-[38px]">
                                  <span className="text-xs font-medium text-stone-900">${order.total?.toFixed(2)}</span>
                                  <span className="text-[10px] text-primary opacity-0 group-hover/order:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                                    Track <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </button>
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
                  value={safeInputValue}
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
                    disabled={isLoading || !safeInputValue.trim() || isOffline}
                    className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all duration-200
                      ${(isLoading || !safeInputValue.trim() || isOffline) 
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200 shadow-none' 
                        : 'bg-stone-900 text-white shadow-md hover:bg-stone-800 hover:shadow-lg'
                      }`}
                    onClick={() => handleDebouncedSubmit()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
