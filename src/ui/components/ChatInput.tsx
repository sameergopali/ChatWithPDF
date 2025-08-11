import React from 'react';

import { useChatStore } from '../stores/chatStore';

export const ChatInput: React.FC = () => {
  const { messageInput, isAiTyping, setInputMessage, sendMessage } = useChatStore();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2.5">
        <textarea
          value={messageInput}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about this PDF..."
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-2xl resize-none min-h-[20px] max-h-[100px] text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={!messageInput.trim() || isAiTyping}
          className={`px-5 py-2.5 rounded-2xl text-white text-sm font-medium transition-colors ${
            messageInput.trim() && !isAiTyping
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};