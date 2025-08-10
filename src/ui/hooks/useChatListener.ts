import { useEffect } from 'react';

import { useChatStore } from '../stores/chatStore';

export const useChatListener = () => {
  const { addMessage, setIsAiTyping } = useChatStore();

  useEffect(() => {
    const handleChatResponse = (_event: any, response: string) => {
      console.log("got event")
        addMessage({
          id: Date.now(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
        });
        setIsAiTyping(false);
    };
    const unsubscribe = window.electronAPI.onChatResponse(handleChatResponse);
    return () => {
      unsubscribe?.();
    };
  }, [addMessage, setIsAiTyping]);
};
