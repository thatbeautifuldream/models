import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TModel } from "@/data/models";
import { CapabilityBadges } from "./capability-badges";
import { ModelImage } from "./model-image";
import { PricingBadge } from "./pricing-badge";

// @ts-expect-error - Ignored due to dynamic data structure
type TModelInstance = TModel["models"][string];
type TProvider = TModel;

type TModelCardProps = {
  model: TModelInstance;
  provider: TProvider;
  providerKey: string;
  uniqueKey: string;
};

export function ModelCard({
  model,
  provider,
  providerKey,
  uniqueKey,
}: TModelCardProps) {
  return (
    <Card
      key={uniqueKey}
      className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col p-4"
    >
      <div className="flex items-center gap-3">
        <ModelImage
          providerKey={providerKey}
          providerName={provider.name}
          className="w-10 h-10 rounded bg-muted p-1"
        />
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold truncate">
            {model.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{provider.name}</p>
        </div>
      </div>

      <div className="mb-4">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2 items-center">
            {model.limit?.context && model.limit.context > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs px-2 py-0.5 cursor-help"
                  >
                    {model.limit.context
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Context length</p>
                </TooltipContent>
              </Tooltip>
            )}

            {"cost" in model &&
              model.cost &&
              (model.cost.input > 0 || model.cost.output > 0) && (
                <PricingBadge
                  input={model.cost.input > 0 ? model.cost.input : undefined}
                  output={model.cost.output > 0 ? model.cost.output : undefined}
                />
              )}
          </div>
        </TooltipProvider>
      </div>

      <div className="mt-auto">
        <CapabilityBadges
          modalities={model.modalities}
          attachment={model.attachment}
          reasoning={model.reasoning}
          tool_call={model.tool_call}
          temperature={model.temperature}
        />
      </div>
    </Card>
  );
}
