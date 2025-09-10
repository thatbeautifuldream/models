import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Model, Capability } from "@/hooks/use-models-search";

type TCapabilityBadgesProps = {
  modalities?: Model["modalities"];
  attachment?: Model["attachment"];
  reasoning?: Model["reasoning"];
  tool_call?: Model["tool_call"];
  temperature?: Model["temperature"];
  onCapabilityClick?: (capability: Capability) => void;
  selectedCapabilities?: Set<Capability>;
};

const CapabilityBadges = React.memo<TCapabilityBadgesProps>(({
  modalities,
  attachment,
  reasoning,
  tool_call,
  temperature,
  onCapabilityClick,
  selectedCapabilities,
}) => {
  const allModalities = [
    ...(modalities?.input || []),
    ...(modalities?.output || []),
  ];
  const uniqueModalities = [...new Set(allModalities)];

  const features = [
    ...(attachment ? ["attachment"] : []),
    ...(reasoning ? ["reasoning"] : []),
    ...(tool_call ? ["tools"] : []),
    ...(temperature ? ["temperature"] : []),
  ];

  const allCapabilities = [...uniqueModalities, ...features];

  if (allCapabilities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {allCapabilities.map((capability) => {
        const isSelected = selectedCapabilities?.has(capability as Capability);
        return (
          <Badge
            key={capability}
            variant={isSelected ? "default" : "outline"}
            className={`text-xs uppercase font-medium tracking-wide transition-colors px-2 py-0.5 select-none ${
              onCapabilityClick 
                ? isSelected 
                  ? "cursor-pointer hover:bg-primary/80" 
                  : "cursor-pointer hover:bg-accent"
                : "cursor-default"
            } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => onCapabilityClick?.(capability as Capability)}
          >
            {capability}
          </Badge>
        );
      })}
    </div>
  );
});

CapabilityBadges.displayName = "CapabilityBadges";

export { CapabilityBadges };
