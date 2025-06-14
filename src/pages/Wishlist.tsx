import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/chat/ProductCard';

export const Wishlist = () => {
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 drop-shadow-lg">My Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 