import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('chatter-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Accepts a full User object
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('chatter-user', JSON.stringify(userData));
    return Promise.resolve(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chatter-user');
    localStorage.removeItem('chat-messages');
  };

  return { user, login, logout };
};
