"use client";

import React, { createContext, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Capability } from "@/hooks/use-models-search";

type CapabilityFilterContextType = {
  selectedCapabilities: Set<Capability>;
  onToggleCapability: (capability: Capability) => void;
  onClearCapabilities: () => void;
  availableCapabilities: Capability[];
};

const CapabilityFilterContext =
  createContext<CapabilityFilterContextType | null>(null);

const useCapabilityFilter = () => {
  const context = useContext(CapabilityFilterContext);
  if (!context) {
    throw new Error(
      "CapabilityFilter compound components must be used within CapabilityFilter"
    );
  }
  return context;
};

type CapabilityFilterProps = {
  selectedCapabilities: Set<Capability>;
  onToggleCapability: (capability: Capability) => void;
  onClearCapabilities: () => void;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<"div">;

// Available capabilities grouped by type
const CAPABILITY_GROUPS = {
  modalities: ["text", "image", "audio", "video"] as Capability[],
  features: ["attachment", "reasoning", "tools", "temperature"] as Capability[],
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
        variant={hasFilters ? "default" : "outline"}
        size="sm"
        className={cn(
          "h-8 px-2 sm:px-3 text-xs gap-1 sm:gap-2 transition-colors",
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

  const handleCheckedChange = (capability: Capability) => () => {
    // Prevent the dropdown from closing by stopping event propagation
    onToggleCapability(capability);
  };

  return (
    <DropdownMenuContent
      align="start"
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

type CapabilityFilterComponent = {
  (props: CapabilityFilterProps): React.ReactElement;
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
}: CapabilityFilterProps) => {
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
        <div className={cn("", className)} {...props}>
          {children}
        </div>
      </DropdownMenu>
    </CapabilityFilterContext.Provider>
  );
};

const CapabilityFilter = CapabilityFilterRoot as CapabilityFilterComponent;

CapabilityFilter.Trigger = CapabilityFilterTrigger;
CapabilityFilter.Content = CapabilityFilterContent;

export { CapabilityFilter };
export type { CapabilityFilterContextType, CapabilityFilterProps };
