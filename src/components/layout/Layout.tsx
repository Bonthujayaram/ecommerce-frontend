import React from 'react';
import { Header } from './Header';
import { FloatingChatbot } from '../chat/FloatingChatbot';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <FloatingChatbot />
    </div>
  );
};
