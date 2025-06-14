import { useState, useEffect, createContext, useContext } from 'react';
import { CartItem, Product } from '@/types/chat';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loading cart from storage:', parsedCart);
      setCart(parsedCart);
    }
  }, []);

  useEffect(() => {
    console.log('Saving cart to storage:', cart);
    localStorage.setItem('ecommerce-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        const newCart = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('Updated cart after adding:', newCart);
        return newCart;
      }
      const newCart = [...prev, { product, quantity: 1 }];
      console.log('Updated cart after adding:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    console.log('Removing from cart:', productId);
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      console.log('Updated cart after removing:', newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log('Updating quantity:', productId, quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      console.log('Updated cart after quantity change:', newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal
  };

  console.log('Cart context value:', value);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart must be used within a CartProvider');
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
