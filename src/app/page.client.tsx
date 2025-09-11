"use client";

import Link from "next/link";
import NumberFlow from '@number-flow/react';
import { useModelsSearch } from "@/hooks/use-models-search";
import { SearchInput } from "@/components/search-input";
import { CapabilityFilter } from "@/components/capability-filter";
import { VirtualizedModelGrid } from "@/components/virtualized-model-grid";

export function ModelsClient() {
  const {
    searchTerm,
    setSearchTerm,
    selectedCapabilities,
    toggleCapability,
    clearCapabilities,
    filteredModels,
  } = useModelsSearch();

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none container mx-auto px-4 py-2">
        <div className="space-y-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search models by name or provider..."
          />
          
          <div className="flex items-center justify-between">
            <Link
              href="https://models.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              <NumberFlow value={filteredModels.length} /> models
            </Link>
            
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
