import { handleEvent, useEvent } from "../api/createEventListener";

export function useHandleSelectionUpdate() {
  useEvent("updateSelectedLayers", (layers) => {
    console.log(layers);
  });
}
