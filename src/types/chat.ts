export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'product' | 'order' | 'error' | 'categories';
  products?: Product[];
  order?: Order;
  showViewMore?: boolean;
  category?: string;
  categories?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: Date;
}

export interface UserSession {
  lastIntent: string | null;
  lastCategory: string | null;
  conversationHistory: Array<{
    message: string;
    timestamp: Date;
  }>;
  productPreferences: string[];
}

export interface ChatResponse {
  message: string;
  type?: 'text' | 'product' | 'order' | 'error' | 'greeting' | 'farewell' | 'cart' | 'help' | 'general';
  products?: Product[];
  order?: Order;
  showViewMore?: boolean;
  category?: string;
}
