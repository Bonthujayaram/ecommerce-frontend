import { createContext, useReducer } from 'react';
import { CartItem } from '@/types/cart';

export type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

type CartState = {
  cart: CartItem[];
};

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: any; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find(item => item.product.id === product.id);

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, { product, quantity }],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] });

  const addToCart = (product: any, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 