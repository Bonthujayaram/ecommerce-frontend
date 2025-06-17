import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Shirt, Dumbbell, Home, Book, Headphones, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/chat';
import { Link, useLocation } from 'react-router-dom';
import { getProductsByCategory } from '@/services/chatService';
import { ProductCard } from '@/components/chat/ProductCard';

export const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Package,
    description: 'Smartphones, laptops, and gadgets',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: Shirt,
    description: 'Clothing, shoes, and accessories',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: Dumbbell,
    description: 'Sports equipment and fitness gear',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    icon: Home,
    description: 'Home appliances and kitchenware',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'books',
    name: 'Books',
    icon: Book,
    description: 'Fiction, non-fiction, and educational',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: Headphones,
    description: 'Phone cases, power banks, and more',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 'shirts',
    name: 'Shirts',
    icon: Shirt,
    description: 'Casual and formal shirts',
    color: 'bg-cyan-100 text-cyan-600'
  }
];

export const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedFromQuery = params.get('selected');
    if (selectedFromQuery) {
      setSelectedCategory(selectedFromQuery);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      getProductsByCategory(selectedCategory).then(setCategoryProducts).finally(() => setLoading(false));
    }
  }, [selectedCategory]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = categoryProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
              <p className="text-gray-300">Browse products by category</p>
            </div>
            {/* Search Bar */}
            <div className="w-full sm:w-[300px] md:w-[350px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={selectedCategory ? "Search products..." : "Search categories..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {!selectedCategory ? (
          // Category Grid with Search
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden relative group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-white/20 group-hover:border-fuchsia-500 transition-all duration-300">
                    <category.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:text-fuchsia-400 transition-all duration-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 text-white group-hover:text-fuchsia-400 transition-colors duration-300 text-center">{category.name}</h3>
                  <p className="text-gray-300 text-xs sm:text-sm text-center group-hover:text-gray-200 transition-colors duration-300">{category.description}</p>
                </CardContent>
              </Card>
            ))}
            {filteredCategories.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400">No categories found matching your search.</p>
              </div>
            )}
            {filteredCategories.length > 0 && (
              <div className="flex items-center justify-center col-span-1 sm:col-span-2 lg:col-span-3">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <span className="bg-gradient-to-r from-fuchsia-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-text-gradient">View All Products</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          // Products in Selected Category with Search
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-500/20 to-blue-500/20 hover:from-fuchsia-500/30 hover:to-blue-500/30 border-fuchsia-500/50 hover:border-fuchsia-500 text-white font-semibold transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-fuchsia-400">←</span>
                    Back to Categories
                  </span>
                </Button>
                <h2 className="text-xl sm:text-2xl font-bold capitalize text-white">{selectedCategory}</h2>
                <Badge variant="secondary">
                  {filteredProducts.length} products
                </Badge>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
                {!loading && filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400">No products found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
