"use client";

import React, { createContext, useContext, useMemo } from "react";
import { Filter, FilterX } from "lucide-react";
import type { TCapability } from "@/hooks/use-models-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TCapabilityFilterContextType = {
  selectedCapabilities: Set<TCapability>;
  onToggleCapability: (capability: TCapability) => void;
  onClearCapabilities: () => void;
  availableCapabilities: TCapability[];
};

const CapabilityFilterContext =
  createContext<TCapabilityFilterContextType | null>(null);

const useCapabilityFilter = () => {
  const context = useContext(CapabilityFilterContext);
  if (!context) {
    throw new Error(
      "CapabilityFilter compound components must be used within CapabilityFilter"
    );
  }
  return context;
};

type TCapabilityFilterProps = {
  selectedCapabilities: Set<TCapability>;
  onToggleCapability: (capability: TCapability) => void;
  onClearCapabilities: () => void;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<"div">;

const CAPABILITY_GROUPS = {
  modalities: ["text", "image", "audio", "video"] as TCapability[],
  features: [
    "attachment",
    "reasoning",
    "tools",
    "temperature",
  ] as TCapability[],
};

const ALL_CAPABILITIES = [
  ...CAPABILITY_GROUPS.modalities,
  ...CAPABILITY_GROUPS.features,
];

function CapabilityFilterTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { selectedCapabilities } = useCapabilityFilter();

  const hasFilters = selectedCapabilities.size > 0;

  return (
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        aria-pressed={hasFilters}
        aria-label={
          hasFilters ? `Filters (${selectedCapabilities.size})` : "Filter"
        }
        variant={hasFilters ? "default" : "outline"}
        size="sm"
        className={cn(
          "h-8 px-2 sm:px-3 text-xs gap-1 sm:gap-2 transition-colors cursor-pointer",
          hasFilters && "bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {hasFilters ? (
          <FilterX className="h-3 w-3" />
        ) : (
          <Filter className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">
          {hasFilters ? `Filters (${selectedCapabilities.size})` : "Filter"}
        </span>
        <span className="sm:hidden">
          {hasFilters ? `${selectedCapabilities.size}` : "Filter"}
        </span>
      </Button>
    </DropdownMenuTrigger>
  );
}

function CapabilityFilterContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  const { selectedCapabilities, onToggleCapability, onClearCapabilities } =
    useCapabilityFilter();

  const handleCheckedChange = (capability: TCapability) => () => {
    onToggleCapability(capability);
  };

  return (
    <DropdownMenuContent
      align="end"
      className={cn("w-56", className)}
      onCloseAutoFocus={(e) => e.preventDefault()}
      {...props}
    >
      <DropdownMenuLabel className="flex items-center justify-between">
        Filter by capabilities
        {selectedCapabilities.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClearCapabilities();
            }}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
        Modalities
      </DropdownMenuLabel>
      {CAPABILITY_GROUPS.modalities.map((capability) => (
        <DropdownMenuCheckboxItem
          key={capability}
          checked={selectedCapabilities.has(capability)}
          onCheckedChange={handleCheckedChange(capability)}
          onSelect={(e) => e.preventDefault()}
          className="capitalize"
        >
          {capability}
        </DropdownMenuCheckboxItem>
      ))}

      <DropdownMenuSeparator />

      <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
        Features
      </DropdownMenuLabel>
      {CAPABILITY_GROUPS.features.map((capability) => (
        <DropdownMenuCheckboxItem
          key={capability}
          checked={selectedCapabilities.has(capability)}
          onCheckedChange={handleCheckedChange(capability)}
          onSelect={(e) => e.preventDefault()}
          className="capitalize"
        >
          {capability}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  );
}

type TCapabilityFilterComponent = {
  (props: TCapabilityFilterProps): React.ReactElement;
  Trigger: typeof CapabilityFilterTrigger;
  Content: typeof CapabilityFilterContent;
};

const CapabilityFilterRoot = ({
  selectedCapabilities,
  onToggleCapability,
  onClearCapabilities,
  className,
  children,
  ...props
}: TCapabilityFilterProps) => {
  const contextValue = useMemo(
    () => ({
      selectedCapabilities,
      onToggleCapability,
      onClearCapabilities,
      availableCapabilities: ALL_CAPABILITIES,
    }),
    [selectedCapabilities, onToggleCapability, onClearCapabilities]
  );

  return (
    <CapabilityFilterContext.Provider value={contextValue}>
      <DropdownMenu>
        <div className={cn(className)} {...props}>
          {children}
        </div>
      </DropdownMenu>
    </CapabilityFilterContext.Provider>
  );
};

const CapabilityFilter = CapabilityFilterRoot as TCapabilityFilterComponent;

CapabilityFilter.Trigger = CapabilityFilterTrigger;
CapabilityFilter.Content = CapabilityFilterContent;

export { CapabilityFilter };
export type { TCapabilityFilterContextType, TCapabilityFilterProps };
