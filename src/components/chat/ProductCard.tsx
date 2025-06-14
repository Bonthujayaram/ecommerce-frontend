import React from 'react';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  compact?: boolean;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the buy button click
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleBuyNow = () => {
    onAddToCart(product);
    toast({
      title: "Item Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 5000, // 5 seconds
      variant: "default",
    });
  };

  return (
    <BackgroundGradient containerClassName="w-[280px] h-[370px] min-h-[370px] mx-auto">
      <div className="w-full h-full min-h-[370px] flex flex-col items-center justify-between overflow-hidden rounded-2xl shadow-md border border-white/10 p-5 bg-black/70 backdrop-blur-sm">
        <div className="w-full flex justify-center items-center h-52 mb-2">
          <img 
            src={product.image} 
            alt={product.name}
            className="object-contain w-[200px] h-[200px] rounded-xl bg-transparent"
          />
        </div>
        <h2 className="text-lg font-bold text-white mb-1 text-center">
          {product.name}
        </h2>
        <div className="flex-1 w-full overflow-y-auto h-20">
          <p className="text-sm text-gray-200 text-center">
            {product.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full px-4 py-1.5 text-white flex items-center gap-2 bg-neutral-900/80 font-semibold text-sm shadow hover:bg-neutral-800 transition-all duration-300"
            onClick={handleBuyNow}
          >
            Buy now
            <span className="bg-neutral-700 rounded-full text-xs px-2 py-0.5 ml-2 font-bold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </button>
          <button
            onClick={handleWishlistClick}
            className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 transition-colors"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-colors",
                inWishlist ? "text-red-500 fill-red-500" : "text-white"
              )} 
            />
          </button>
        </div>
      </div>
    </BackgroundGradient>
  );
};
