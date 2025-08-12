
import { useChatStore } from '../stores/chatStore';
import React, { useRef, useEffect } from 'react';

export const ChatInput: React.FC = () => {
  const { messageInput, isAiTyping, setInputMessage, sendMessage } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the actual scrollHeight
    textarea.style.height = 'auto';

    // Set the height to fit the content, with min and max constraints
    const scrollHeight = textarea.scrollHeight;
    const minHeight = 44; // Approximate height for 1 row with padding
    const maxHeight = 200; // Max height before scrolling

    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height when messageInput changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [messageInput]);

  // Adjust height on component mount
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className=' p-2 border border-gray-200 rounded-2xl bg-white '>
        <textarea
          ref={textareaRef}
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Ask about this PDF..."
          className="w-full px-3 py-2.5  rounded-2xl resize-none text-sm outline-none overflow-y-auto"
          style={{ minHeight: '44px', maxHeight: '200px' }}
        />
      <div className="flex items-center justify-end">
        <button
              onClick={sendMessage}
              disabled={!messageInput.trim() || isAiTyping}
              className={`px-5 py-2.5 rounded-2xl text-white text-sm font-small transition-colors ${
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