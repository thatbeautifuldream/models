import React, { createContext, useContext, useMemo } from "react";
import type { TCapability, TModel } from "@/hooks/use-models-search";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TCapabilityBadgesContextType = {
  capabilities: string[];
  onCapabilityClick?: (capability: TCapability) => void;
  selectedCapabilities?: Set<TCapability>;
};

const CapabilityBadgesContext =
  createContext<TCapabilityBadgesContextType | null>(null);

const useCapabilityBadges = () => {
  const context = useContext(CapabilityBadgesContext);
  if (!context) {
    throw new Error(
      "CapabilityBadges compound components must be used within CapabilityBadges"
    );
  }
  return context;
};

type TCapabilityBadgesProps = {
  modalities?: TModel["modalities"];
  attachment?: TModel["attachment"];
  reasoning?: TModel["reasoning"];
  tool_call?: TModel["tool_call"];
  temperature?: TModel["temperature"];
  onCapabilityClick?: (capability: TCapability) => void;
  selectedCapabilities?: Set<TCapability>;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<"div">;

function CapabilityBadgesList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { capabilities } = useCapabilityBadges();

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {capabilities.map((capability) => (
        <CapabilityBadge
          key={capability}
          capability={capability as TCapability}
        />
      ))}
    </div>
  );
}

type TCapabilityBadgeProps = {
  capability: TCapability;
  className?: string;
} & Omit<React.ComponentProps<typeof Badge>, "onClick" | "variant">;

function CapabilityBadge({
  capability,
  className,
  ...props
}: TCapabilityBadgeProps) {
  const { onCapabilityClick, selectedCapabilities } = useCapabilityBadges();
  
  const isSelected = selectedCapabilities?.has(capability);

  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      role={onCapabilityClick ? "button" : undefined}
      aria-pressed={onCapabilityClick ? !!isSelected : undefined}
      tabIndex={onCapabilityClick ? 0 : -1}
      onKeyDown={(e) => {
        if (!onCapabilityClick) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onCapabilityClick(capability)
        }
      }}
      className={cn(
        "text-xs uppercase font-medium tracking-wide transition-colors px-2 py-0.5 select-none",
        onCapabilityClick 
          ? isSelected 
            ? "cursor-pointer hover:bg-primary/80" 
            : "cursor-pointer hover:bg-accent"
          : "cursor-default",
        isSelected && "bg-primary text-primary-foreground",
        className
      )}
      onClick={() => onCapabilityClick?.(capability)}
      {...props}
    >
      {capability}
    </Badge>
  );
}

type CapabilityBadgesComponent = {
  (props: TCapabilityBadgesProps): React.ReactElement | null;
  List: typeof CapabilityBadgesList;
  Badge: typeof CapabilityBadge;
};

const CapabilityBadgesRoot = ({
  modalities,
  attachment,
  reasoning,
  tool_call,
  temperature,
  onCapabilityClick,
  selectedCapabilities,
  className,
  children,
  ...props
}: TCapabilityBadgesProps) => {
  const capabilities = useMemo(() => {
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

    return [...uniqueModalities, ...features];
  }, [modalities, attachment, reasoning, tool_call, temperature]);

  const contextValue = useMemo(() => ({
    capabilities,
    onCapabilityClick,
    selectedCapabilities,
  }), [capabilities, onCapabilityClick, selectedCapabilities]);

  if (capabilities.length === 0) return null;

  return (
    <CapabilityBadgesContext.Provider value={contextValue}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </CapabilityBadgesContext.Provider>
  );
};

const CapabilityBadges = CapabilityBadgesRoot as CapabilityBadgesComponent;

CapabilityBadges.List = CapabilityBadgesList;
CapabilityBadges.Badge = CapabilityBadge;

export { CapabilityBadges };
export type { TCapabilityBadgesContextType, TCapabilityBadgesProps };