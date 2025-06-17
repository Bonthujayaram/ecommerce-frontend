import axios from 'axios';
import { Product } from '@/types/chat';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-rnen.onrender.com';

// Helper function to transform backend product to frontend format
const transformProduct = (backendProduct: any): Product => ({
  id: String(backendProduct.id),
  name: backendProduct.name,
  description: backendProduct.description || '',
  price: Number(backendProduct.price),
  image: backendProduct.image_url,
  category: backendProduct.category,
  rating: backendProduct.rating
});

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products/search`, {
      params: { q: searchTerm }
    });
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products/category/${category}`);
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}; 