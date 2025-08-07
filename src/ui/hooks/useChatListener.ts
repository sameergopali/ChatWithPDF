import { useEffect } from 'react';

import { useChatStore } from '../stores/chatStore';

export const useChatListener = () => {
  const { addMessage, setIsAiTyping } = useChatStore();

  useEffect(() => {
    const handleChatResponse = (event: any, response: string) => {
        addMessage({
          id: Date.now(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
        });
        setIsAiTyping(false);
    };
    window.electronAPI.onChatResponse(handleChatResponse);

  }, []);
};
