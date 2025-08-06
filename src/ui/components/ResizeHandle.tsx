import React from 'react';

import { useUIStore } from '../stores/uiStore';

export const ResizeHandle: React.FC = () => {
  const { setIsResizing } = useUIStore();

  return (
    <div
      onMouseDown={() => setIsResizing(true)}
      className="w-1 bg-gray-300 cursor-col-resize border-l border-r border-gray-400 hover:bg-gray-400 transition-colors"
    />
  );
};