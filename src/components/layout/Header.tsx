import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/config';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = async () => {
    // Call backend to clear session
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/ecoshop1.png" 
              alt="EcoShop Logo" 
              className="h-10 w-10 object-contain hover:scale-110 transition-transform duration-200"
            />
            <span className="text-2xl font-bold text-white">EcoShop</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-lg text-white hover:text-primary transition-colors cursor-pointer hover:scale-105 transition-transform font-bold">
                  <span
                    className="block max-w-[100px] truncate sm:max-w-none"
                    title={user.name}
                  >
                    Hi, {user.name}
                  </span>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="ml-2">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
                      alt="Profile" 
                      className="h-5 w-5" 
                      title="Profile - Young icons created by Freepik - Flaticon"
                    />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
                    alt="Profile" 
                    className="h-5 w-5" 
                    title="Profile - Young icons created by Freepik - Flaticon"
                  />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
