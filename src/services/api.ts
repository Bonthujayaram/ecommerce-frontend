import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-rnen.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  try {
    const response = await api.post('/users/signup', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default api; 