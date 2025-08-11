import React, { useRef } from 'react';

import { useChatListener } from '../hooks/useChatListener';
import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export const ChatSidebar: React.FC = () => {
  const { messages, isAiTyping } = useChatStore();
  const { isSidebarOpen, sidebarWidth, toggleSidebar } = useUIStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useChatListener();

  if (!isSidebarOpen) return null;

  return (
    <div 
      className="bg-white border-l border-gray-300 flex flex-col min-w-[250px]"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="m-0 text-base font-semibold text-gray-800">AI Assistant</h3>
        <button
          onClick={toggleSidebar}
          className="bg-none border-none text-lg cursor-pointer p-0 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-5 overflow-y-auto flex flex-col gap-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 italic p-5">
            Ask me anything about this PDF document!
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isAiTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-600 text-sm italic">
              AI is typing...
            </div>
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
};