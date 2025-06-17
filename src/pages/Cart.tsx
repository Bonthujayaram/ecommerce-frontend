import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, X, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 text-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-24 w-24 text-zinc-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">Your cart is empty</h1>
          <p className="text-zinc-400 mb-8">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-950 py-8 text-zinc-100">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-4 sm:mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex-1 flex flex-col",
              "p-4 rounded-xl",
              "bg-zinc-900",
              "border border-zinc-800",
              "max-h-[32rem]",
              "overflow-hidden"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-medium text-zinc-100">
                    Cart Items ({totalItems})
                </h2>
            </div>
            <motion.div
                className={cn(
                    "flex-1 overflow-y-auto",
                    "min-h-0",
                    "-mx-4 px-4",
                    "space-y-3"
                )}
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {cart.map((item) => (
                        <motion.div
                            key={item.product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{
                                opacity: { duration: 0.2 },
                                layout: { duration: 0.2 },
                            }}
                            className={cn(
                                "flex items-center gap-3",
                                "p-2 rounded-lg",
                                "bg-zinc-800/50",
                                "mb-3"
                            )}
                        >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-700">
                                <img
                                    src={item.product.image || '/placeholder.svg'}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-100 truncate">
                                        {item.product.name}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            removeFromCart(item.product.id)
                                        }
                                        className="p-1 rounded-md hover:bg-zinc-700"
                                    >
                                        <X className="w-3 h-3 text-zinc-400" />
                                    </motion.button>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.product.id,
                                                    item.quantity - 1
                                                )
                                            }
                                            className="p-1 rounded-md hover:bg-zinc-700"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </motion.button>
                                        <motion.span
                                            layout
                                            className="text-xs text-zinc-400 min-w-[16px] inline-block text-center"
                                        >
                                            {item.quantity}
                                        </motion.span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.product.id,
                                                    item.quantity + 1
                                                )
                                            }
                                            className="p-1 rounded-md hover:bg-zinc-700"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </motion.button>
                                    </div>
                                    <motion.span
                                        layout
                                        className="text-xs text-zinc-400"
                                    >
                                        ₹
                                        {(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            <div className="mt-3 text-center">
                <Button variant="outline" size="sm" onClick={clearCart} className="text-red-400 hover:text-red-500 border-red-400 hover:border-red-500">
                    <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
                </Button>
            </div>
          </motion.div>

          {/* Cart Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "w-full lg:w-80 flex flex-col",
                "p-4 rounded-xl",
                "bg-zinc-900",
                "border border-zinc-800",
                "sticky top-4",
                "max-h-[32rem]"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-medium text-zinc-100">
                    Order Summary
                </h2>
            </div>
            <motion.div
                layout
                className={cn(
                    "flex-1 overflow-y-auto",
                    "min-h-0",
                    "-mx-4 px-4",
                    "space-y-3",
                    "pt-3 mt-3", // Added padding and margin top for consistent styling
                    "border-t border-zinc-800" // Added border top
                )}
            >
                {cart.map((item) => (
                    <div key={`summary-${item.product.id}`} className="flex justify-between text-sm text-zinc-300">
                        <span className="truncate max-w-[120px]">{item.product.name} x{item.quantity}</span>
                        <span>₹{(item.product.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                ))}
            </motion.div>

            <motion.div
                layout
                className={cn(
                    "pt-3 mt-3",
                    "border-t border-zinc-800",
                    "bg-zinc-900"
                )}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-100">
                        Total
                    </span>
                    <motion.span
                        layout
                        className="text-sm font-semibold text-zinc-100 inline-block min-w-[80px] text-right"
                    >
                        <NumberFlow
                            value={cartTotal}
                            willChange
                            format={{
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                signDisplay: "auto",
                            }}
                            className="font-mono tabular-nums"
                            transformTiming={{
                                duration: 400,
                                easing: "ease-out",
                            }}
                        />
                    </motion.span>
                </div>
                <Button 
                    size="sm" 
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate('/checkout')}
                >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                </Button>
                <Link to="/products" className="block mt-2">
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                        Continue Shopping
                    </Button>
                </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
