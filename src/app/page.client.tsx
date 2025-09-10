"use client";

import Link from "next/link";
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
    <div className="container mx-auto px-4 py-2">
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search models by name or provider..."
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredModels.length} models
            </span>
            <Link
              href="https://models.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline hover:no-underline whitespace-nowrap"
            >
              Data from models.dev
            </Link>
          </div>
        </div>
        
        <CapabilityFilter
          selectedCapabilities={selectedCapabilities}
          onToggleCapability={toggleCapability}
          onClearCapabilities={clearCapabilities}
        />
      </div>

      <VirtualizedModelGrid 
        models={filteredModels} 
        searchTerm={searchTerm}
        selectedCapabilities={selectedCapabilities}
        onCapabilityClick={toggleCapability}
      />
    </div>
  );
}
