import React from 'react';

import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}>
      <div className="max-w-[80%]">
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-5 ${
          message.sender === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {message.text}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${
          message.sender === 'user' ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
