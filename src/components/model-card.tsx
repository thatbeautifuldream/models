import React, { useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CapabilityBadges } from "./capability-badges";
import { ModelImage } from "./model-image";
import { PricingBadge } from "./pricing-badge";
import type { ModelEntry, Capability } from "@/hooks/use-models-search";

type TModelCardProps = ModelEntry & {
  selectedCapabilities?: Set<Capability>;
  onCapabilityClick?: (capability: Capability) => void;
};

const ModelCard = React.memo<TModelCardProps>(({
  model,
  provider,
  providerKey,
  uniqueKey,
  selectedCapabilities,
  onCapabilityClick,
}) => {
  // Memoize expensive calculations
  const contextLimit = useMemo(() => {
    if (!model.limit?.context || Number(model.limit.context) <= 0) return null;
    return model.limit.context.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [model.limit?.context]);

  const hasCost = useMemo(() => {
    return "cost" in model && 
           model.cost && 
           (Number(model.cost.input) > 0 || Number(model.cost.output) > 0);
  }, [model.cost]);

  // Memoize the capability click handler to prevent unnecessary re-renders
  const handleCapabilityClick = useCallback((capability: Capability) => {
    onCapabilityClick?.(capability);
  }, [onCapabilityClick]);
  return (
    <Card
      key={uniqueKey}
      className="hover:shadow-lg transition-shadow duration-200 h-[240px] flex flex-col p-3"
    >
      <div className="flex items-start gap-3 mb-3 h-[50px]">
        <ModelImage
          providerKey={providerKey}
          providerName={provider.name}
          className="w-9 h-9 rounded bg-muted p-1 flex-shrink-0"
        />
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          <CardTitle className="text-base font-semibold truncate leading-tight">
            {model.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">{provider.name}</p>
        </div>
      </div>

      <div className="mb-3 min-h-[24px]">
        <TooltipProvider>
          <div className="flex flex-wrap gap-1.5 items-center">
            {contextLimit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs px-1.5 py-0.5 cursor-help h-5"
                  >
                    {contextLimit}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Context length</p>
                </TooltipContent>
              </Tooltip>
            )}

            {hasCost && (
              <PricingBadge
                input={model.cost.input}
                output={model.cost.output}
              />
            )}
          </div>
        </TooltipProvider>
      </div>

      <div className="mt-auto flex-1">
        <CapabilityBadges
          modalities={model.modalities}
          attachment={model.attachment}
          reasoning={model.reasoning}
          tool_call={model.tool_call}
          temperature={model.temperature}
          onCapabilityClick={handleCapabilityClick}
          selectedCapabilities={selectedCapabilities}
        />
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom equality check for better performance
  return (
    prevProps.uniqueKey === nextProps.uniqueKey &&
    prevProps.selectedCapabilities === nextProps.selectedCapabilities &&
    prevProps.onCapabilityClick === nextProps.onCapabilityClick
  );
});

ModelCard.displayName = "ModelCard";

export { ModelCard };
