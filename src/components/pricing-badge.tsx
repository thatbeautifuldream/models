import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TPricingBadgeProps = {
  input?: number;
  output?: number;
};

export function PricingBadge({ input, output }: TPricingBadgeProps) {
  const hasInput = input !== undefined && input > 0;
  const hasOutput = output !== undefined && output > 0;

  if (!hasInput && !hasOutput) return null;

  if (hasInput && hasOutput) {
    return (
      <TooltipProvider>
        <div className="inline-flex rounded-lg overflow-hidden text-xs font-medium border">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 py-0.5 border-r cursor-help">
                ${input}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Input pricing per token</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 py-0.5 cursor-help">
                ${output}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Output pricing per token</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  if (hasInput) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium border cursor-help">
              ${input}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Input pricing per token</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex rounded-lg px-2 py-0.5 text-xs font-medium border cursor-help">
            ${output}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Output pricing per token</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
