import { updateSelectedLayers } from "./handlerFuncs/updateSelectedLayer";
import { startPluginHandlers } from "./messaging";

startPluginHandlers();

figma.showUI(__html__, { width: 800, height: 600 });

figma.on("selectionchange", () => {
  updateSelectedLayers();
});
