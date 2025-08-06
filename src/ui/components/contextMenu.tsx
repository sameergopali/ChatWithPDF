import React, { useEffect } from 'react';

import { useChatStore } from '../stores/chatStore';
import { useUIStore } from '../stores/uiStore';

export const ContextMenu: React.FC = () => {
  const { contextMenu, hideContextMenu, setSidebarOpen } = useUIStore();
  const { sendSelectedText } = useChatStore();
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.isVisible) {
        hideContextMenu();
      }
    };
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && contextMenu.isVisible) {
        hideContextMenu();
      }
    };
    if (contextMenu.isVisible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [contextMenu.isVisible, hideContextMenu]);
  const handleCopyText = () => {
    if (contextMenu.selectedText) {
      navigator.clipboard.writeText(contextMenu.selectedText).then(() => {
        console.log('Text copied to clipboard');
      }).catch((err) => {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = contextMenu.selectedText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
      });
    }
    hideContextMenu();
  };
  const handleSendToChat = () => {
    if (contextMenu.selectedText) {
      setSidebarOpen(true); // Open chat sidebar if it's closed
      sendSelectedText(contextMenu.selectedText);
    }
    hideContextMenu();
  };
  if (!contextMenu.isVisible) return null;
  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50 min-w-[150px]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleCopyText}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
      >
        <span>📋</span>
        Copy Text
      </button>
      <hr className="border-gray-200 my-1" />
      <button
        onClick={handleSendToChat}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
      >
        <span>💬</span>
        Send to AI Chat
      </button>
      {contextMenu.selectedText && (
        <>
          <hr className="border-gray-200 my-1" />
          <div className="px-4 py-2 text-xs text-gray-500 max-w-[200px] truncate">
            "{contextMenu.selectedText}"
          </div>
        </>
      )}
    </div>
  );
};



