import { useState } from "react";
import { useEvent } from "../api/createEventListener";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { selectedLayerStore } from "../stores/selectedLayerStore";

const MAX_BADGES_DISPLAYED_INITIAL = 7;

export function SelectionDisplay() {
  const selectedLayers = selectedLayerStore.use("layers");
  // const [selectedLayers, setSelectedLayers] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // useEvent("updateSelectedLayers", (layers) => {
  //   setSelectedLayers(layers);
  //   if (layers.length <= MAX_BADGES_DISPLAYED_INITIAL) {
  //       setIsExpanded(false);
  //   }
  // });

  const displayLayers = isExpanded
    ? selectedLayers
    : selectedLayers.slice(0, MAX_BADGES_DISPLAYED_INITIAL);

  const showToggleButton = selectedLayers.length > MAX_BADGES_DISPLAYED_INITIAL;

  if (selectedLayers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-row flex-wrap items-center gap-1 bg-transparent p-4 pb-0 transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-40 overflow-y-auto" : "overflow-hidden"
        )}
      >
        {displayLayers.map((layer) => (
          <Tooltip key={layer.id}>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="max-w-24 flex-shrink-0 cursor-default"
              >
                <span className="truncate overflow-hidden w-full block">
                  {layer.name}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {layer.page} / {layer.name}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {showToggleButton && (
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0 ml-1 flex-shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : `View all (${selectedLayers.length})`}
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
