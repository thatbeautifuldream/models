"use client";

import { useEffect, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { CapabilityFilter } from "@/components/capability-filter";
import { SearchInput, type TSearchInputRef } from "@/components/search-input";
import { VirtualizedModelGrid } from "@/components/virtualized-model-grid";
import { useModelsSearch } from "@/hooks/use-models-search";

export function ModelsClient() {
  const searchInputRef = useRef<TSearchInputRef>(null);
  const {
    searchTerm,
    setSearchTerm,
    selectedCapabilities,
    toggleCapability,
    clearCapabilities,
    filteredModels,
    allModels,
    isLoading,
  } = useModelsSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading && allModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-sm text-muted-foreground">Loading models…</div>
        <div className="text-xs text-muted-foreground/60">
          Fetching from API and initializing cache
        </div>
      </div>
    );
  }

  if (!isLoading && allModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-sm text-destructive">
          Failed to load models data
        </div>
        <div className="text-xs text-muted-foreground">
          Check console for details
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col select-none">
      <div className="flex-none container mx-auto px-4 py-3">
        <div className="space-y-3">
          <SearchInput
            ref={searchInputRef}
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              <NumberFlow value={filteredModels.length} /> models
            </span>

            <CapabilityFilter
              selectedCapabilities={selectedCapabilities}
              onToggleCapability={toggleCapability}
              onClearCapabilities={clearCapabilities}
            >
              <CapabilityFilter.Trigger />
              <CapabilityFilter.Content />
            </CapabilityFilter>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <VirtualizedModelGrid
          models={filteredModels}
          searchTerm={searchTerm}
          selectedCapabilities={selectedCapabilities}
          onCapabilityClick={toggleCapability}
        />
      </div>
    </div>
  );
}
