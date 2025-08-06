import { create } from 'zustand';

import { ChatState, ChatMessage } from '../types';

interface ChatStore extends ChatState {
  // Actions
  setInputMessage: (message: string) => void;
  addMessage: (message: ChatMessage) => void;
  setIsAiTyping: (isTyping: boolean) => void;
  sendMessage: () => Promise<void>;
  sendSelectedText: (text: string) => void;
  clearMessages: () => void;
}

const initialChatState: ChatState = {
  messages: [],
  messageInput: '',
  isAiTyping: false,
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialChatState,

  setInputMessage: (messageInput) => set({ messageInput }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setIsAiTyping: (isAiTyping) => set({ isAiTyping }),
  
  sendMessage: async () => {
    const { messageInput } = get();
    if (!messageInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date()
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      inputMessage: '',
      isAiTyping: true
    }));

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `I understand you're asking about: "${userMessage.text}". I can help you analyze this PDF document. What specific information would you like me to extract or explain?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      set((state) => ({
        messages: [...state.messages, aiMessage],
        isAiTyping: false
      }));
    }, 1000 + Math.random() * 2000);
  },
  
  clearMessages: () => set({ messages: [] }),
  sendSelectedText: (selectedText) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: selectedText,
      sender: 'user',
      timestamp: new Date()
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isAiTyping: true
    }));
  }
}));