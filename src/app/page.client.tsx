"use client";

import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Keyboard, Github as GithubIcon } from "lucide-react";
import NumberFlow from "@number-flow/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { CapabilityFilter } from "@/components/capability-filter";
import { SearchInput, type TSearchInputRef } from "@/components/search-input";
import { VirtualizedModelGrid } from "@/components/virtualized-model-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { useModelsSearch } from "@/hooks/use-models-search";
import { useModels } from "@/hooks/use-models";
import type { TCapability } from "@/hooks/use-models-search";

export function ModelsClient() {
  const searchInputRef = useRef<TSearchInputRef>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const { refetch } = useModels();

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  const {
    searchTerm,
    setSearchTerm,
    selectedCapabilities,
    toggleCapability,
    clearCapabilities,
    filteredModels,
    isLoading,
  } = useModelsSearch();

  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();
      searchInputRef.current?.focus();
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "escape",
    () => {
      if (searchTerm) {
        setSearchTerm("");
      } else if (showHelp) {
        setShowHelp(false);
      }
    },
    { enableOnFormTags: true }
  );

  useHotkeys("mod+shift+c", (e) => {
    e.preventDefault();
    if (selectedCapabilities.size > 0) {
      clearCapabilities();
    }
  });

  useHotkeys("mod+r", (e) => {
    e.preventDefault();
    refetch();
  });

  useHotkeys(
    "mod+slash",
    (e) => {
      e.preventDefault();
      setShowHelp((prev) => !prev);
    },
    { preventDefault: true }
  );

  useHotkeys("shift+t", (e) => {
    e.preventDefault();
    toggleCapability("text" as TCapability);
  });

  useHotkeys("shift+i", (e) => {
    e.preventDefault();
    toggleCapability("image" as TCapability);
  });

  useHotkeys("shift+a", (e) => {
    e.preventDefault();
    toggleCapability("audio" as TCapability);
  });

  useHotkeys("shift+v", (e) => {
    e.preventDefault();
    toggleCapability("video" as TCapability);
  });

  useHotkeys("shift+r", (e) => {
    e.preventDefault();
    toggleCapability("reasoning" as TCapability);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-sm text-muted-foreground">Loading models…</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col select-none">
      <div className="flex-none container mx-auto px-4 py-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group text-sm font-medium text-foreground transition-colors whitespace-nowrap p-2 border hover:border-primary"
            >
              models.surf{" "}
              <span className="hidden sm:inline text-muted-foreground/80 group-hover:text-foreground transition-colors">
                by milind
              </span>
            </Link>
            <div className="flex-1">
              <SearchInput
                ref={searchInputRef}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                <NumberFlow value={filteredModels.length} /> models
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="h-8 w-8 p-0 border"
              >
                <a
                  href="https://github.com/thatbeautifuldream/models"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowHelp((prev) => !prev)}
                className="h-8 w-8 p-0 border cursor-pointer"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

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
      </div>

      {showHelp && (
        <div className="flex-none container mx-auto px-4 pb-3">
          <div className="border p-4 bg-card text-card-foreground text-xs space-y-2">
            <div className="font-semibold mb-2">Keyboard Shortcuts</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Search</span>
                <Kbd>{isMac ? "⌘" : "Ctrl+"}K</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clear search</span>
                <Kbd>Esc</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refresh data</span>
                <Kbd>{isMac ? "⌘" : "Ctrl+"}R</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clear filters</span>
                <Kbd>{isMac ? "⌘⇧" : "Ctrl+Shift+"}C</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle text</span>
                <Kbd>Shift+T</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle image</span>
                <Kbd>Shift+I</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle audio</span>
                <Kbd>Shift+A</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle video</span>
                <Kbd>Shift+V</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle reasoning</span>
                <Kbd>Shift+R</Kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shortcuts help</span>
                <Kbd>{isMac ? "⌘/" : "Ctrl+/"}</Kbd>
              </div>
            </div>
          </div>
        </div>
      )}

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
