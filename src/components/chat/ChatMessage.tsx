import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 max-w-[80%]`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-600">
            {isUser ? 'You' : 'EcoShop Assistant'}
          </span>
          <span className="text-xs text-gray-600">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div
          className={`rounded-lg px-4 py-2 max-w-full ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.type && message.type !== 'text' && (
          <Badge variant="outline" className="mt-1 text-xs">
            {message.type}
          </Badge>
        )}
      </div>
    </div>
  );
};
