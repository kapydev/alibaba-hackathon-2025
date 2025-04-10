import { createStore } from "@shared";
import type { updateSelectedLayers } from "@figmaplugincore-types/handlerFuncs/updateSelectedLayer";
import { handleEvent } from "../api/createEventListener";
import { sendMidEnd } from "../api/sendMidEnd";

export const selectedLayerStore = createStore({
  layers: [] as Awaited<ReturnType<typeof updateSelectedLayers>>,
});

handleEvent("updateSelectedLayers", (layers) => {
  selectedLayerStore.set("layers", layers);
});

sendMidEnd("updateSelectedLayers");
