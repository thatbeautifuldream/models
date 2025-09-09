import { Badge } from "@/components/ui/badge";
import type { TModel } from "@/data/models";

// @ts-expect-error - Ignored due to dynamic data structure
type TModelInstance = TModel["models"][string];

type TCapabilityBadgesProps = {
  modalities?: TModelInstance["modalities"];
  attachment?: TModelInstance["attachment"];
  reasoning?: TModelInstance["reasoning"];
  tool_call?: TModelInstance["tool_call"];
  temperature?: TModelInstance["temperature"];
};

export function CapabilityBadges({
  modalities,
  attachment,
  reasoning,
  tool_call,
  temperature,
}: TCapabilityBadgesProps) {
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
      {allCapabilities.map((capability) => (
        <Badge
          key={capability}
          variant="outline"
          className="text-xs uppercase font-medium tracking-wide hover:bg-accent transition-colors px-2 py-0.5 select-none cursor-pointer"
        >
          {capability}
        </Badge>
      ))}
    </div>
  );
}
