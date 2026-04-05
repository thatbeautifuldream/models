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
import { VirtualizedModelList } from "@/components/virtualized-model-list";
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 isolate">
        <div className="text-base text-muted-foreground">Loading models…</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col select-none isolate">
      <div className="flex-none border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="group flex items-baseline gap-2 transition-colors"
              >
                <span className="text-xl font-semibold text-foreground">models.surf</span>
                <span className="hidden sm:inline text-sm text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-300 transition-colors">
                  by milind
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <span className="text-base font-semibold text-foreground tabular-nums">
                  <NumberFlow value={filteredModels.length} />
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">models</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SearchInput
                ref={searchInputRef}
                value={searchTerm}
                onChange={setSearchTerm}
              />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 w-9"
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
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp((prev) => !prev)}
                className="h-9 w-9"
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
        <div className="flex-none border-b border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-6 rounded-xl">
              <div className="text-base font-semibold mb-4">Keyboard Shortcuts</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">
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
        </div>
      )}

      <div className="flex-1 min-h-0">
        <VirtualizedModelList
          models={filteredModels}
          searchTerm={searchTerm}
          selectedCapabilities={selectedCapabilities}
          onCapabilityClick={toggleCapability}
        />
      </div>
    </div>
  );
}
