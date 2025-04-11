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
          "flex flex-row flex-wrap items-center gap-1.5 p-3 pb-2 border-t border-border bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-40 overflow-y-auto" : "max-h-16 overflow-hidden"
        )}
      >
        {displayLayers.map((layer) => (
          <Tooltip key={layer.id}>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="max-w-28 flex-shrink-0 cursor-default shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="truncate overflow-hidden w-full block">
                  {layer.name}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {layer.page} / {layer.name}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {showToggleButton && (
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0 ml-1 flex-shrink-0 text-muted-foreground hover:text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : `+${selectedLayers.length - MAX_BADGES_DISPLAYED_INITIAL} more`}
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
