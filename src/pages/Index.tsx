import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { Layout } from '@/components/layout/Layout';
import { Home } from './Home';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect handled by useEffect
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Layout>
        <Home />
      </Layout>
    </div>
  );
};

export default Index;
