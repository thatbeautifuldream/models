import React, { createContext, useCallback, useContext, useMemo } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TCapability, TModelEntry } from "@/hooks/use-models-search";
import { cn } from "@/lib/utils";
import { CapabilityBadges } from "./capability-badges";
import { ModelImage } from "./model-image";
import { PricingBadge } from "./pricing-badge";

type TModelCardContextType = {
  model: TModelEntry["model"];
  provider: TModelEntry["provider"];
  providerKey: TModelEntry["providerKey"];
  uniqueKey: TModelEntry["uniqueKey"];
  selectedCapabilities?: Set<TCapability>;
  onCapabilityClick?: (capability: TCapability) => void;
};

const ModelCardContext = createContext<TModelCardContextType | null>(null);

const useModelCard = () => {
  const context = useContext(ModelCardContext);
  if (!context) {
    throw new Error(
      "ModelCard compound components must be used within ModelCard"
    );
  }
  return context;
};

type TModelCardProps = Omit<TModelEntry, "modelKey"> & {
  selectedCapabilities?: Set<TCapability>;
  onCapabilityClick?: (capability: TCapability) => void;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Card>;

function ModelCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const {
    model,
    provider,
    providerKey,
    selectedCapabilities,
    onCapabilityClick,
  } = useModelCard();

  const handleCapabilityClick = useCallback(
    (capability: TCapability) => {
      onCapabilityClick?.(capability);
    },
    [onCapabilityClick]
  );

  const contextLimit = useMemo(() => {
    if (!model.limit?.context || Number(model.limit.context) <= 0) return null;
    return model.limit.context.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, [model.limit?.context]);

  const hasCost = useMemo(() => {
    return (
      "cost" in model &&
      model.cost &&
      (Number(model.cost.input) > 0 || Number(model.cost.output) > 0)
    );
  }, [model]);

  return (
    <div className={cn("mb-3", className)} {...props}>
      <div className="flex items-start justify-between mb-3">
        <ModelImage
          providerKey={providerKey}
          providerName={provider.name}
          className="size-14 p-1 flex-shrink-0 dark:invert"
        />

        <div className="flex flex-col gap-2 items-end">
          {contextLimit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex px-2 py-0.5 text-xs font-medium font-mono border cursor-help">
                    {contextLimit}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Context length</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {hasCost && "cost" in model && model.cost && (
            <PricingBadge input={model.cost.input} output={model.cost.output} />
          )}
        </div>
      </div>

      <div className="mb-3">
        <CardTitle className="text-base font-semibold truncate leading-tight mb-0.5">
          {model.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground truncate mb-2">
          {provider.name}
        </p>

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
    </div>
  );
}

function ModelCardMetadata({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("mb-3", className)} {...props} />;
}

function ModelCardCapabilities({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />;
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
  const contextValue = useMemo(
    () => ({
      model,
      provider,
      providerKey,
      uniqueKey,
      selectedCapabilities,
      onCapabilityClick,
    }),
    [
      model,
      provider,
      providerKey,
      uniqueKey,
      selectedCapabilities,
      onCapabilityClick,
    ]
  );

  return (
    <ModelCardContext.Provider value={contextValue}>
      <Card
        className={cn(
          "hover:shadow-lg transition-shadow duration-200 flex flex-col p-4",
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
export type { TModelCardContextType, TModelCardProps };
