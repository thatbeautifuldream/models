"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { TCapability, TModelEntry } from "@/hooks/use-models-search";
import { ModelCard } from "./model-card";

type TVirtualizedModelListProps = {
  models: TModelEntry[];
  searchTerm: string;
  selectedCapabilities?: Set<TCapability>;
  onCapabilityClick?: (capability: TCapability) => void;
};

const ROW_HEIGHT = 120;
const ROW_HEIGHT_MOBILE = 140;
const GAP = 10;

const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
};

const VirtualizedModelList = React.memo<TVirtualizedModelListProps>(
  ({ models, searchTerm, selectedCapabilities, onCapabilityClick }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const isMobile = useScreenSize();
    const rowHeight = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT;

    const virtualizer = useVirtualizer({
      count: models.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => rowHeight + GAP,
      overscan: 5,
      getItemKey: (index) => models[index].uniqueKey,
    });

    return (
      <div className="w-full h-full">
        <div
          ref={parentRef}
          className="h-full overflow-y-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingTop: `${GAP}px`,
            paddingBottom: `${GAP}px`,
          }}
        >
          <div
            className="container mx-auto px-4"
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const entry = models[virtualRow.index];
              if (!entry) return null;

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
                    className="transition-opacity duration-300 ease-out"
                    style={{
                      opacity: 1,
                      transitionDelay: searchTerm ? "0ms" : "50ms",
                    }}
                  >
                    <ModelCard
                      {...entry}
                      selectedCapabilities={selectedCapabilities}
                      onCapabilityClick={onCapabilityClick}
                      className={isMobile ? "h-[130px]" : "h-[110px]"}
                    >
                      <ModelCard.Header />
                    </ModelCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

VirtualizedModelList.displayName = "VirtualizedModelList";

export { VirtualizedModelList };
