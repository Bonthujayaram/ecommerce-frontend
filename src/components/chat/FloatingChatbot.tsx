import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Bot } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { useAuth } from '@/hooks/useAuth';

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-[9999] pointer-events-auto bg-gradient-to-r from-fuchsia-500 to-blue-600 hover:from-fuchsia-600 hover:to-blue-700 border-none p-0 flex items-center justify-center group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 blur-sm group-hover:blur-md transition-all duration-300"></div>
          {/* Icon */}
          {isOpen ? (
            <X className="h-5 w-5 md:h-6 md:w-6 text-white relative z-10" />
          ) : (
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H8.01M12 12H12.01M16 12H16.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-24 right-4 md:right-6 w-[calc(100%-32px)] md:w-96 h-[500px] md:h-[600px] z-[9999] shadow-2xl rounded-lg overflow-hidden pointer-events-auto bg-black text-white">
          <div className="relative h-full bg-black border border-gray-800 rounded-lg text-white">
            <div className="h-full flex flex-col">
              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface 
                  user={user} 
                  onLogout={() => {}} 
                  isFloating={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
