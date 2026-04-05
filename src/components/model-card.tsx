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
    <div className={cn("h-full", className)} {...props}>
      <div className="flex items-center justify-between gap-6 h-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="size-14 p-2.5 flex-shrink-0 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 ring-1 ring-neutral-950/5 dark:ring-white/10 flex items-center justify-center">
            <ModelImage
              providerKey={providerKey}
              providerName={provider.name}
              className="size-9 dark:invert"
            />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate mb-1">
              {model.name}
            </CardTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate mb-2">
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

        <div className="flex items-center gap-3 flex-shrink-0">
          {contextLimit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex px-3 py-1.5 text-sm font-semibold font-mono bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-950/10 dark:ring-white/10 rounded-lg cursor-help whitespace-nowrap">
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
            <div className="flex items-baseline gap-3 whitespace-nowrap">
              {Number(model.cost.input) > 0 && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">in</span>
                  <span className="text-base font-semibold font-mono tabular-nums">${model.cost.input}</span>
                </div>
              )}
              {Number(model.cost.output) > 0 && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">out</span>
                  <span className="text-base font-semibold font-mono tabular-nums">${model.cost.output}</span>
                </div>
              )}
            </div>
          )}
        </div>
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
          "ring-1 ring-neutral-950/5 dark:ring-white/10 hover:ring-neutral-950/10 dark:hover:ring-white/20 flex flex-col px-4 py-3 transition-shadow duration-200",
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
