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

const MAX_BADGES_DISPLAYED = 7;

export function SelectionDisplay() {
  const [selectedLayers, setSelectedLayers] = useState<any[]>([]);

  useEvent("updateSelectedLayers", (layers) => {
    setSelectedLayers(layers);
  });

  const displayLayers = selectedLayers.slice(0, MAX_BADGES_DISPLAYED);
  const hasMoreLayers = selectedLayers.length > MAX_BADGES_DISPLAYED;

  return (
    <TooltipProvider>
      <div className="flex flex-row flex-wrap items-center gap-1 bg-muted p-2 overflow-hidden">
        {displayLayers.map((layer) => (
          <Tooltip key={layer.id}>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="bg-background dark:bg-background/50 max-w-24 flex-shrink-0 cursor-default"
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
        {hasMoreLayers && (
          <Button variant="link" size="sm" className="text-xs h-auto p-0 ml-1 flex-shrink-0">
            View all ({selectedLayers.length})
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
