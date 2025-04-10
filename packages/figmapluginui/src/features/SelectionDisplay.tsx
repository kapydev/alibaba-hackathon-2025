import { useState } from "react";
import { useEvent } from "../api/createEventListener";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MAX_BADGES_DISPLAYED = 5;

export function SelectionDisplay() {
  const [selectedLayers, setSelectedLayers] = useState<any[]>([]);

  useEvent("updateSelectedLayers", (layers) => {
    setSelectedLayers(layers);
  });

  const displayLayers = selectedLayers.slice(0, MAX_BADGES_DISPLAYED);
  const hasMoreLayers = selectedLayers.length > MAX_BADGES_DISPLAYED;

  return (
    <div className="flex flex-row flex-wrap items-center gap-1 bg-muted p-2 overflow-hidden">
      {displayLayers.map((layer) => (
        <Badge
          variant="secondary"
          className="bg-background dark:bg-background/50 max-w-24 flex-shrink-0"
          key={layer.id}
        >
          <span className="truncate overflow-hidden w-full block">
            {layer.name}
          </span>
        </Badge>
      ))}
      {hasMoreLayers && (
        <Button variant="link" size="sm" className="text-xs h-auto p-0 ml-1 flex-shrink-0">
          View all ({selectedLayers.length})
        </Button>
      )}
    </div>
  );
}
