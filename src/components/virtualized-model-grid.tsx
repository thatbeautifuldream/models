"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ModelCard } from "./model-card";
import type { ModelEntry, Capability } from "@/hooks/use-models-search";

type VirtualizedModelGridProps = {
  models: ModelEntry[];
  searchTerm: string;
  selectedCapabilities?: Set<Capability>;
  onCapabilityClick?: (capability: Capability) => void;
};

const COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

const CARD_HEIGHT = 240; // Fixed card height
const CARD_HEIGHT_MOBILE = 200; // Smaller height for mobile
const GAPS = {
  mobile: 8,
  tablet: 10,
  desktop: 12,
  wide: 14,
} as const;

// Debounced hook to get current screen size and update on resize
const useScreenSize = (): keyof typeof COLUMNS => {
  const [screenSize, setScreenSize] = useState<keyof typeof COLUMNS>(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width >= 1280) return 'wide';
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        let newSize: keyof typeof COLUMNS;
        
        if (width >= 1280) newSize = 'wide';
        else if (width >= 1024) newSize = 'desktop';
        else if (width >= 768) newSize = 'tablet';
        else newSize = 'mobile';
        
        setScreenSize((prev) => (prev === newSize ? prev : newSize));
      }, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

const VirtualizedModelGrid = React.memo<VirtualizedModelGridProps>(({ 
  models, 
  searchTerm, 
  selectedCapabilities, 
  onCapabilityClick
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const screenSize = useScreenSize();
  const columns = COLUMNS[screenSize];
  const cardHeight = screenSize === 'mobile' ? CARD_HEIGHT_MOBILE : CARD_HEIGHT;

  // Group models into rows for virtualization
  const rows = useMemo(() => {
    const result: ModelEntry[][] = [];
    for (let i = 0; i < models.length; i += columns) {
      result.push(models.slice(i, i + columns));
    }
    return result;
  }, [models, columns]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + GAPS[screenSize],
    overscan: 2, // Reduced overscan for better performance
    getItemKey: (index) => `row-${index}`,
  });

  // Get responsive grid classes
  const getGridClasses = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div className="w-full h-full container mx-auto px-4">
      <div
        ref={parentRef}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingTop: `${GAPS[screenSize]}px`,
          paddingBottom: `${GAPS[screenSize]}px`,
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;

            return (
              <div
                key={virtualRow.key}
                className="absolute inset-x-0"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div 
                  className={`grid ${getGridClasses()}`}
                  style={{
                    gap: `${GAPS[screenSize]}px`,
                  }}
                >
                  {row.map((entry, colIndex) => (
                    <div
                      key={entry.uniqueKey}
                      className="transition-opacity duration-300 ease-out"
                      style={{
                        opacity: 1,
                        transitionDelay: searchTerm ? '0ms' : `${Math.min(colIndex * 50, 150)}ms`,
                      }}
                    >
                      <ModelCard 
                        {...entry} 
                        selectedCapabilities={selectedCapabilities}
                        onCapabilityClick={onCapabilityClick}
                        className={screenSize === 'mobile' ? 'h-[200px]' : 'h-[240px]'}
                      >
                        <ModelCard.Header />
                        <ModelCard.Metadata />
                        <ModelCard.Capabilities />
                      </ModelCard>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualizedModelGrid.displayName = "VirtualizedModelGrid";

export { VirtualizedModelGrid };