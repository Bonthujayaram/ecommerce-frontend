import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/chat/ProductCard';

const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones',
    price: 7999,
    category: 'electronics',
    inStock: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch',
    price: 15999,
    category: 'electronics',
    inStock: true,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
  },
  {
    id: '19',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker',
    price: 7199,
    category: 'home',
    inStock: true,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop'
  }
];

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on orders over ₹999'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment processing'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support'
  }
];

export const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="w-full h-screen relative">
        {/* Mobile-specific background */}
        <div className="absolute inset-0 md:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-purple-950"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-fuchsia-950/50 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_80%)]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        {/* Desktop background */}
        <div className="hidden md:block absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
            style={{ 
              backgroundImage: 'url(/ecoshp2.png)',
              backgroundSize: '100% 100%',
              backgroundAttachment: 'fixed'
            }}
          />
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center">
          <div className="space-y-8 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to EcoShop
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Discover amazing products with our AI shopping assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-fuchsia-600 to-orange-400 text-white shadow-lg hover:scale-105 transition-transform duration-200 w-full sm:w-auto"
                onClick={() => navigate('/products')}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200 w-full sm:w-auto backdrop-blur-sm"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile glow effects */}
        <div className="absolute inset-0 pointer-events-none md:hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="h-1 w-32 mx-auto my-8 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full animate-pulse"></div>

      {/* Features Section with enhanced styling */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>
        <div className="max-w-screen-lg mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl shadow-xl p-8 backdrop-blur-xl hover:scale-105 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with enhanced styling */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-300">Discover our most popular items</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/products">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
