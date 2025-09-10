"use client";

import React, { useRef, useMemo } from "react";
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
const GAP = 16; // Grid gap

const VirtualizedModelGrid = React.memo<VirtualizedModelGridProps>(({ 
  models, 
  searchTerm, 
  selectedCapabilities, 
  onCapabilityClick
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate columns based on screen size
  const columns = useMemo(() => {
    if (typeof window === 'undefined') return COLUMNS.desktop;
    
    const width = window.innerWidth;
    if (width >= 1280) return COLUMNS.wide;
    if (width >= 1024) return COLUMNS.desktop;
    if (width >= 768) return COLUMNS.tablet;
    return COLUMNS.mobile;
  }, []);

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
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3, // Render 3 extra items above and below viewport
    getItemKey: (index) => `row-${index}`,
  });

  return (
    <div className="w-full">
      <div
        ref={parentRef}
        className="h-[calc(100vh-85px)] overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
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
                  className={`grid gap-4 ${
                    columns === 1 ? 'grid-cols-1' :
                    columns === 2 ? 'grid-cols-2' :
                    columns === 3 ? 'grid-cols-3' :
                    'grid-cols-4'
                  }`}
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
                      />
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