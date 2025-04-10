import { handleChangeColor } from "@figmaplugincore-types/handleFuncsEditFigma/handleChangeColor";
import { runFocusNode } from "../handlerFuncs/focusNode";
import {
  getFullDesignImageFromSelectedFrame,
  getImageFromSelectedFrame,
} from "../handlerFuncs/getImageFromSelectedFrame";
import { handleGetSelectedIds } from "../handlerFuncs/handleGetSelectedIds";
import { handleResize } from "../handlerFuncs/handleResize";
import {
  getSelectedLayersFull,
  updateSelectedLayers,
} from "@figmaplugincore-types/handlerFuncs/updateSelectedLayer";

export type PluginCoreHandlers = typeof pluginCoreHandlers;

export const pluginCoreHandlers = {
  resize: handleResize,
  getImageFromSelectedFrame,
  getFullDesignImageFromSelectedFrame,
  getSelectedIds: handleGetSelectedIds,
  focusNode: runFocusNode,
  updateSelectedLayers,
  getSelectedLayersFull,
  //FIGMA EDITING
  handleChangeColor,
} satisfies Record<string, (...args: any[]) => any>;
