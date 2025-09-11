import React, { useMemo, useCallback, createContext, useContext } from "react";
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
import { cn } from "@/lib/utils";
import type { ModelEntry, Capability } from "@/hooks/use-models-search";

type ModelCardContextType = {
  model: ModelEntry["model"];
  provider: ModelEntry["provider"];
  providerKey: ModelEntry["providerKey"];
  uniqueKey: ModelEntry["uniqueKey"];
  selectedCapabilities?: Set<Capability>;
  onCapabilityClick?: (capability: Capability) => void;
};

const ModelCardContext = createContext<ModelCardContextType | null>(null);

const useModelCard = () => {
  const context = useContext(ModelCardContext);
  if (!context) {
    throw new Error("ModelCard compound components must be used within ModelCard");
  }
  return context;
};

type TModelCardProps = ModelEntry & {
  selectedCapabilities?: Set<Capability>;
  onCapabilityClick?: (capability: Capability) => void;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Card>;

function ModelCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { model, provider, providerKey } = useModelCard();
  
  return (
    <div 
      className={cn("flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3 h-[40px] sm:h-[50px]", className)} 
      {...props}
    >
      <ModelImage
        providerKey={providerKey}
        providerName={provider.name}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-muted p-1 flex-shrink-0"
      />
      <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
        <CardTitle className="text-sm sm:text-base font-semibold truncate leading-tight">
          {model.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate">{provider.name}</p>
      </div>
    </div>
  );
}

function ModelCardMetadata({ className, ...props }: React.ComponentProps<"div">) {
  const { model } = useModelCard();
  
  const contextLimit = useMemo(() => {
    if (!model.limit?.context || Number(model.limit.context) <= 0) return null;
    return model.limit.context.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [model.limit?.context]);

  const hasCost = useMemo(() => {
    return "cost" in model && 
           model.cost && 
           (Number(model.cost.input) > 0 || Number(model.cost.output) > 0);
  }, [model]);

  return (
    <div className={cn("mb-2 sm:mb-3 min-h-[20px] sm:min-h-[24px]", className)} {...props}>
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

          {hasCost && "cost" in model && model.cost && (
            <PricingBadge
              input={model.cost.input}
              output={model.cost.output}
            />
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

function ModelCardCapabilities({ className, ...props }: React.ComponentProps<"div">) {
  const { model, selectedCapabilities, onCapabilityClick } = useModelCard();
  
  const handleCapabilityClick = useCallback((capability: Capability) => {
    onCapabilityClick?.(capability);
  }, [onCapabilityClick]);

  return (
    <div className={cn("mt-auto flex-1", className)} {...props}>
      <CapabilityBadges
        modalities={model.modalities}
        attachment={model.attachment}
        reasoning={model.reasoning}
        tool_call={model.tool_call}
        temperature={model.temperature}
        onCapabilityClick={handleCapabilityClick}
        selectedCapabilities={selectedCapabilities}
      >
        <CapabilityBadges.List />
      </CapabilityBadges>
    </div>
  );
}

type ModelCardComponent = {
  (props: TModelCardProps): React.ReactElement;
  Header: typeof ModelCardHeader;
  Metadata: typeof ModelCardMetadata;
  Capabilities: typeof ModelCardCapabilities;
};

const ModelCardRoot = ({ 
  model,
  provider, 
  providerKey,
  uniqueKey,
  selectedCapabilities,
  onCapabilityClick,
  className,
  children,
  ...props 
}: TModelCardProps) => {
  const contextValue = useMemo(() => ({
    model,
    provider,
    providerKey,
    uniqueKey,
    selectedCapabilities,
    onCapabilityClick,
  }), [model, provider, providerKey, uniqueKey, selectedCapabilities, onCapabilityClick]);

  return (
    <ModelCardContext.Provider value={contextValue}>
      <Card
        className={cn(
          "hover:shadow-lg transition-shadow duration-200 h-[240px] sm:h-[240px] flex flex-col p-2 sm:p-3",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </ModelCardContext.Provider>
  );
};

const ModelCard = ModelCardRoot as ModelCardComponent;

ModelCard.Header = ModelCardHeader;
ModelCard.Metadata = ModelCardMetadata;
ModelCard.Capabilities = ModelCardCapabilities;

export { ModelCard };
export type { ModelCardContextType, TModelCardProps };