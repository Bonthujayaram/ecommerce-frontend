import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, RotateCcw, Bot, ChevronDown, History, X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ProductCard } from './ProductCard';
import { OrderSummary } from './OrderSummary';
import { chatService } from '@/services/chatService';
import { Message, Product, CartItem } from '@/types/chat';
import { User } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '@/config';
import { categories as allCategories } from '@/pages/Categories';

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
  isFloating?: boolean;
}

// Utility to extract JSON action block from LLM response
function extractActionBlock(text: string): { action: string, [key: string]: any } | null {
  const match = text.match(/\{[\s\S]*?\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

export const ChatInterface = ({ user, onLogout, isFloating = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(inputValue, cart);

      // Extract action block (JSON) if present
      const actionBlock = extractActionBlock(response.message);

      // Remove JSON block from the message content
      const textOnly = response.message.replace(/\{[\s\S]*?\}/, '').trim();

      // If action is show_categories, show categories as buttons
      if (actionBlock && actionBlock.action === "show_categories") {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: textOnly || "Sorry, I couldn't find what you were looking for. Here are all categories:",
            sender: 'bot',
            timestamp: new Date(),
            type: 'categories',
            categories: allCategories.map(cat => cat.id)
          }
        ]);
        return;
      }

      // Otherwise, show the normal bot message (without JSON)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: textOnly,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type || 'text',
        products: response.products,
        order: response.order,
        showViewMore: response.showViewMore,
        category: response.category
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    
    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      content: `Perfect! I've added "${product.name}" to your cart. You now have a great product worth ₹${product.price.toLocaleString('en-IN')}. Would you like to continue shopping or check out your cart?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleResetConversation = async () => {
    // Save current chat log to backend before reset
    await saveChatLog(messages);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello ${user.name}! 👋 I'm your EcoShop Assistant, ready to help you with all your shopping needs. I can find products, provide recommendations, analyze features, and assist with your entire shopping journey. What can I help you find today?`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
    setShowOrderSummary(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Show scroll-to-bottom button if not at bottom
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
  };
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const saveChatLog = async (msgs: Message[]) => {
    try {
      await fetch(`${BASE_URL}/chatlog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: msgs.map(m => ({
            content: m.content,
            sender: m.sender,
            timestamp: m.timestamp,
          }))
        })
      });
    } catch (e) {}
  };

  // Helper: Render category suggestion grid
  const renderCategorySuggestions = () => (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          className={
            `flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-br from-black/90 via-black/70 to-black/90 border-2 border-white/20 hover:border-fuchsia-500 hover:text-fuchsia-400 transition-all duration-200 text-xs font-semibold text-white`
          }
          onClick={() => navigate(`/categories?selected=${cat.id}`)}
        >
          <cat.icon className={`h-4 w-4 ${cat.color.split(' ').find(c => c.startsWith('text-')) || ''}`} />
          {cat.name}
        </button>
      ))}
    </div>
  );

  if (isFloating) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with history button */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <div className="flex-1 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">EcoShop Assistant</h3>
              <p className="text-xs opacity-90">Your AI Shopping Companion</p>
            </div>
          </div>
        </div>
        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage message={message} />
                {message.products && (
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {message.products.slice(0, 2).map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
                {message.order && (
                  <OrderSummary order={message.order} />
                )}
                {message.type === 'categories' && message.categories && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.categories.map((catId) => {
                      const cat = allCategories.find(c => c.id === catId);
                      if (!cat) return null;
                      return (
                        <Button
                          key={cat.id}
                          variant="outline"
                          className="flex flex-col items-center p-4 min-w-[160px] min-h-[100px]"
                          onClick={() => navigate(`/categories?selected=${encodeURIComponent(cat.id)}`)}
                        >
                          <span className="font-semibold text-base">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
                {message.sender === 'bot' && renderCategorySuggestions()}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span>EcoShop Assistant is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t p-4">
          {cart.length > 0 && (
            <div className="mb-3 text-center">
              <Badge variant="secondary" className="gap-1">
                Cart: {cart.length} items (₹{cartTotal.toLocaleString('en-IN')})
              </Badge>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Ask EcoShop Assistant anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-black"
              style={{ color: 'black' }}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 w-full max-w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header with history button */}
        <Card className="mb-4 backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  EcoShop Assistant Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {cart.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Cart: {cart.length} items (₹{cartTotal.toLocaleString('en-IN')})
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleResetConversation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <div className="relative h-[60vh] sm:h-[600px] w-full max-w-full">
            <div
              ref={scrollAreaRef}
              className="overflow-auto h-full p-2 sm:p-4 w-full max-w-full"
              onScroll={handleScroll}
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="space-y-4">
                {messages.filter(m => !/^```json/.test(m.content)).map((message) => (
                  <div key={message.id}>
                    <ChatMessage message={message} />
                    {message.products && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          {message.products.slice(0, 2).map((product) => (
                            <ProductCard 
                              key={product.id} 
                              product={product} 
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </div>
                        {message.showViewMore && message.category && (
                          <div className="flex justify-center mt-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/categories?selected=${encodeURIComponent(message.category)}`)}
                            >
                              View More
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    {message.order && (
                      <OrderSummary order={message.order} />
                    )}
                    {message.type === 'categories' && message.categories && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {message.categories.map((catId) => {
                          const cat = allCategories.find(c => c.id === catId);
                          if (!cat) return null;
                          return (
                            <Button
                              key={cat.id}
                              variant="outline"
                              className="flex flex-col items-center p-2 min-w-[80px] min-h-[60px]"
                              onClick={() => navigate(`/categories?selected=${encodeURIComponent(cat.id)}`)}
                            >
                              <span className="font-semibold text-xs">{cat.name}</span>
                              <span className="text-[10px] text-muted-foreground text-center leading-tight">{cat.description}</span>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    {message.sender === 'bot' && renderCategorySuggestions()}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                    <span>EcoShop Assistant is thinking...</span>
                  </div>
                )}
              </div>
            </div>
            {showScrollButton && (
              <button
                className="absolute right-4 bottom-4 bg-gray-900 bg-opacity-90 hover:bg-opacity-100 text-white rounded-full p-3 shadow-lg z-50 flex items-center justify-center border border-white/20 transition-all"
                onClick={scrollToBottom}
                aria-label="Scroll to bottom"
                style={{ width: 48, height: 48 }}
              >
                <ChevronDown className="h-6 w-6" />
              </button>
            )}
          </div>
          
          {/* Input Area */}
          <div className="border-t p-2 sm:p-4 w-full flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Ask EcoShop Assistant about products, recommendations, or shopping help..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 min-w-0 text-black"
              style={{ color: 'black' }}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
