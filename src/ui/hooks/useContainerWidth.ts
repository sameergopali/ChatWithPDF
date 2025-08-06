import { useEffect } from 'react';

import { useUIStore } from '../stores/uiStore';

export const useContainerWidth = (containerRef: React.RefObject<HTMLDivElement|null>) => {
  const { isSidebarOpen, sidebarWidth, setContainerWidth } = useUIStore();

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const availableWidth = isSidebarOpen 
          ? containerRef.current.clientWidth - sidebarWidth - 40
          : containerRef.current.clientWidth - 40;
        setContainerWidth(availableWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isSidebarOpen, sidebarWidth, setContainerWidth, containerRef]);
};
