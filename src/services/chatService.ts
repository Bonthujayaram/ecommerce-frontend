import { ChatResponse, Product, CartItem, Order, UserSession } from '@/types/chat';
import { BASE_URL } from '@/config';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

// Session management for better context awareness
class ChatSession {
  private static instance: ChatSession;
  private sessions: Map<string, UserSession>;

  private constructor() {
    this.sessions = new Map();
  }

  static getInstance(): ChatSession {
    if (!ChatSession.instance) {
      ChatSession.instance = new ChatSession();
    }
    return ChatSession.instance;
  }

  getSession(userId: string): UserSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        lastIntent: null,
        lastCategory: null,
        conversationHistory: [],
        productPreferences: [],
      });
    }
    return this.sessions.get(userId)!;
  }

  updateSession(userId: string, updates: Partial<UserSession>) {
    const current = this.getSession(userId);
    this.sessions.set(userId, { ...current, ...updates });
  }
}

// Enhanced intent analysis with more patterns
const intentPatterns = {
  search: [
    /search|find|looking for|show me|get me|want to buy/i,
    /where can i|how to get|available|in stock/i
  ],
  category: [
    /electronics|fashion|sports|home|books|accessories/i,
    /category|section|department/i
  ],
  recommend: [
    /recommend|suggest|what('s| is) good|best|top|popular/i,
    /which (one|product)|what should/i
  ],
  cart: [
    /cart|basket|shopping bag|checkout|buy now|purchase/i,
    /order|payment|delivery|shipping/i
  ],
  help: [
    /help|guide|how (to|do|can)|what can you do/i,
    /support|assist|explain|tell me about/i
  ],
  greeting: [
    /^(hi|hello|hey|namaste|good (morning|afternoon|evening)|hola)/i
  ],
  farewell: [
    /bye|goodbye|thank you|thanks|see you|talk to you later/i
  ]
};

// Extract price range from message
function extractPriceRange(message: string): { min?: number; max?: number } | null {
  const underPattern = /under (?:Rs\.?|₹)?(\d+)/i;
  const rangePattern = /(?:Rs\.?|₹)?(\d+) ?- ?(?:Rs\.?|₹)?(\d+)/i;
  const abovePattern = /above (?:Rs\.?|₹)?(\d+)/i;

  let match = message.match(underPattern);
  if (match) {
    return { max: parseInt(match[1]) };
  }

  match = message.match(rangePattern);
  if (match) {
    return {
      min: parseInt(match[1]),
      max: parseInt(match[2])
    };
  }

  match = message.match(abovePattern);
  if (match) {
    return { min: parseInt(match[1]) };
  }

  return null;
}

// Filter products by price range
function filterProductsByPrice(products: Product[], priceRange: { min?: number; max?: number } | null): Product[] {
  if (!priceRange || (!priceRange.min && !priceRange.max)) return products;
  
  return products.filter(product => {
    if (!product.price) return false;
    const meetsMinPrice = !priceRange.min || product.price >= priceRange.min;
    const meetsMaxPrice = !priceRange.max || product.price <= priceRange.max;
    return meetsMinPrice && meetsMaxPrice;
  });
}

// Improved product request analysis
function analyzeProductRequest(message: string): { 
  intent: string; 
  category?: string; 
  searchQuery?: string;
} {
  const lowerMessage = message.toLowerCase();
  
  // Common product-related words
  const productWords = ['shirt', 'shirts', 'phone', 'phones', 'book', 'books', 'shoe', 'shoes', 'watch', 'watches'];
  const hasProductWord = productWords.some(word => lowerMessage.includes(word));
  
  // Price-related patterns
  const hasPricePattern = /under|above|rs\.?|₹|\d+|-/i.test(lowerMessage);
  
  // If message contains product words or price patterns, treat it as a search
  if (hasProductWord || hasPricePattern) {
    return { 
      intent: 'search',
      searchQuery: message
    };
  }

  // Category detection
  const categories = ['electronics', 'fashion', 'sports', 'home', 'books', 'accessories'];
  const foundCategory = categories.find(cat => lowerMessage.includes(cat));
  if (foundCategory) {
    return { 
      intent: 'category',
      category: foundCategory
    };
  }

  // Other intents remain the same
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return { intent: 'recommend' };
  }
  
  if (lowerMessage.includes('cart') || lowerMessage.includes('checkout')) {
    return { intent: 'cart' };
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return { intent: 'help' };
  }

  return { intent: 'general' };
}

// Enhanced error handling for API calls
async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 
      "I apologize, but I couldn't process that request. How else can I help you?";
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error.name === 'AbortError') {
      return "I'm taking a bit longer than usual to respond. Could you please try again?";
    }
    return "I'm experiencing some technical difficulties. Please try again in a moment.";
  }
}

// Get personalized follow-up based on context
function getFollowUp(intent: string, category?: string, cart?: CartItem[]): string {
  const suggestions = {
    search: [
      "Would you like to see more products or refine your search?",
      "I can help you filter by price or category. What would you prefer?",
      "Should I show you similar products or something different?"
    ],
    category: [
      `Want to explore more in ${category} or check another category?`,
      "Would you like to see the best-selling items in this category?",
      "I can help you filter these products. What's your budget?"
    ],
    recommend: [
      "Would you like more specific recommendations based on your preferences?",
      "Should I show you more options or help you compare these?",
      "Would you like to know more about any of these products?"
    ],
    cart: cart?.length ? [
      "Ready to checkout or still shopping?",
      "Would you like to review your cart or continue shopping?",
      "Can I help you find anything else to add to your cart?"
    ] : [
      "Let me help you find something you'll love. What are you looking for?",
      "Would you like to see our trending products?",
      "What kind of products interest you?"
    ],
    help: [
      "What specific aspect would you like to know more about?",
      "Is there anything specific you'd like help with?",
      "Would you like me to explain any feature in detail?"
    ],
    greeting: [
      "What can I help you find today?",
      "What kind of products are you interested in?",
      "Would you like to see our latest arrivals?"
    ],
    farewell: [
      "Is there anything else you'd like to know before you go?",
      "Don't hesitate to ask if you need help later!",
      "Have a great day! Feel free to come back if you need anything."
    ]
  };

  const intentSuggestions = suggestions[intent] || suggestions.help;
  return intentSuggestions[Math.floor(Math.random() * intentSuggestions.length)];
}

async function getRecommendedProducts(): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    return allProducts
      .filter(p => p.rating && p.rating > 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

export const chatService = {
  async sendMessage(
    message: string, 
    currentCart: CartItem[], 
    userId: string = 'default'
  ): Promise<ChatResponse> {
    try {
      const session = ChatSession.getInstance().getSession(userId);
      const analysis = analyzeProductRequest(message);
      const priceRange = extractPriceRange(message);

      // Update session with new interaction
      session.conversationHistory.push({ message, timestamp: new Date() });
      session.lastIntent = analysis.intent;
      if (analysis.category) session.lastCategory = analysis.category;

      // Clean search term (remove price-related words)
      const searchTerm = message
        .replace(/under|above|rs\.?|₹|\d+|-/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Handle product-related queries directly
      if (analysis.intent === 'search' || analysis.intent === 'category') {
        let products: Product[] = [];
        
        if (searchTerm) {
          products = await searchProducts(searchTerm);
        }
        
        if (products.length === 0 && analysis.category) {
          products = await getProductsByCategory(analysis.category);
        }

        const filteredProducts = filterProductsByPrice(products, priceRange);

        if (filteredProducts.length === 0) {
          const recommendations = await getRecommendedProducts();
          return {
            message: `I couldn't find any products matching "${searchTerm}"${priceRange?.max ? ` under ₹${priceRange.max}` : ''}. Here are some recommended products you might like:`,
            type: 'product',
            products: recommendations,
            showViewMore: recommendations.length > 6
          };
        }

        const priceRangeText = priceRange?.max ? ` under ₹${priceRange.max}` : '';
        return {
          message: `Here are the products matching "${searchTerm}"${priceRangeText}:`,
          type: 'product',
          products: filteredProducts.slice(0, 6),
          showViewMore: filteredProducts.length > 6,
          category: analysis.category || searchTerm
        };
      }

      // Handle cart queries directly
      if (analysis.intent === 'cart') {
        if (currentCart.length === 0) {
          const recommendations = await getRecommendedProducts();
          return {
            message: "Your cart is empty. Here are some popular products you might like:",
            type: 'product',
            products: recommendations,
            showViewMore: recommendations.length > 6
          };
        }
        
        const cartTotal = currentCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        return {
          message: `You have ${currentCart.length} item(s) in your cart, totaling ₹${cartTotal}. Would you like to checkout?`,
          type: 'cart'
        };
      }

      // Handle recommendations directly
      if (analysis.intent === 'recommend') {
        const recommendations = await getRecommendedProducts();
        return {
          message: "Here are some recommended products based on popularity and ratings:",
          type: 'product',
          products: recommendations,
          showViewMore: recommendations.length > 6
        };
      }

      // For help and general queries, use Gemini API with structured context
      const contextPrompt = `You are EcoShop Assistant, a professional and helpful AI assistant for an Indian e-commerce platform called EcoShop. 

Current context:
- User's question: "${message}"
- Cart items: ${currentCart.length}

Guidelines:
1. You are EcoShop's AI assistant, helping users understand and use the platform
2. Keep responses friendly, concise, and informative
3. Use Indian Rupees (₹) when discussing prices
4. For lists, use numbered format (1., 2., 3.)
5. Don't suggest specific products - that's handled separately
6. Focus on explaining EcoShop's features, policies, and how to use the platform
7. If asked about your identity, say you're EcoShop's AI shopping assistant
8. End responses with a relevant follow-up question

Available features to mention:
1. Product search and browsing
2. Category navigation (Electronics, Fashion, Sports, Home, Books, Accessories)
3. Price filtering
4. Shopping cart management
5. Order tracking
6. User profiles
7. Address management
8. Wishlists

Please provide a helpful response to: "${message}"`;

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: contextPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0]?.content?.parts[0]?.text;

        if (!aiResponse) {
          return {
            message: "I'm here to help you with shopping on EcoShop! You can ask about our products, features, or how to use the platform. What would you like to know?",
            type: 'text'
          };
        }

        return {
          message: aiResponse,
          type: 'text'
        };
      } catch (error) {
        console.error('Gemini API error:', error);
        return {
          message: "I'm here to help you with shopping on EcoShop! You can ask about our products, features, or how to use the platform. What would you like to know?",
          type: 'text'
        };
      }
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        message: "I'm having trouble processing your request. Please try again or browse our categories directly.",
        type: 'error'
      };
    }
  }
};

// API functions with better error handling
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const products = await response.json();
    return products.map((product: any) => ({
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image_url,
      category: product.category,
      rating: product.rating
    }));
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const cleanQuery = query.trim().toLowerCase();
    const response = await fetch(
      `${BASE_URL}/products/search?q=${encodeURIComponent(cleanQuery)}`,
      { 
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const products = await response.json();
    return products.map((product: any) => ({
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image_url,
      category: product.category,
      rating: product.rating
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/products/category/${encodeURIComponent(category)}`,
      { 
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Category fetch failed: ${response.status}`);
    }
    
    const products = await response.json();
    return products.map((product: any) => ({
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image_url,
      category: product.category,
      rating: product.rating
    }));
  } catch (error) {
    console.error('Category fetch error:', error);
    return [];
  }
}
