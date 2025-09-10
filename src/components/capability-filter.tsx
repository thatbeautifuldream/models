"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Capability } from "@/hooks/use-models-search";

type CapabilityFilterProps = {
  selectedCapabilities: Set<Capability>;
  onToggleCapability: (capability: Capability) => void;
  onClearCapabilities: () => void;
};


export function CapabilityFilter({
  selectedCapabilities,
  onToggleCapability,
  onClearCapabilities,
}: CapabilityFilterProps) {
  if (selectedCapabilities.size === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filters:</span>
      {Array.from(selectedCapabilities).map((capability) => (
        <Badge
          key={capability}
          variant="default"
          className="text-xs uppercase font-medium tracking-wide cursor-pointer hover:bg-primary/80 transition-colors px-2 py-0.5 pr-1"
          onClick={() => onToggleCapability(capability)}
        >
          {capability}
          <X className="h-3 w-3 ml-1" />
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearCapabilities}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}