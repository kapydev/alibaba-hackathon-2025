import { runFocusNode } from "../handlerFuncs/focusNode";
// import { handleExportStylesToFigma } from '../handleExportStylesToFigma';
// import { deselectAll } from '../handlerFuncs/deselectAll';

import {
  getFullDesignImageFromSelectedFrame,
  getImageFromSelectedFrame,
} from "../handlerFuncs/getImageFromSelectedFrame";
// import { getImageArrBufs } from '../handlerFuncs/getImageArrBuf';
// import { getJSONTrees } from '../handlerFuncs/getJSONTree';
// import { getNodeSVGs } from '../handlerFuncs/getNodeSVGs';
// import { getNumberOfConversions } from '../handlerFuncs/getNumberOfConversions';
// import {
//   handleCreateComponentLibrary,
//   handleCreateComponentLibraryAndSampleInstances,
// } from '../handlerFuncs/handleCreateComponentLibrary';
// import { handleDownloadTestCases } from '../handlerFuncs/handleDownloadTestCases';
// import {
//   handleDeserialize,
//   handleGenerateAndDeserialize,
// } from '../handlerFuncs/handleGenerateAndDeserialize/handleGenerateAndDeserialize';
// import { handleGetBlockingNodes } from '../handlerFuncs/handleGetBlockingNodes';
// import { handleGetSavedConfiguration } from '../handlerFuncs/handleGetSavedConfiguration';
import { handleGetSelectedIds } from "../handlerFuncs/handleGetSelectedIds";
// import { handleGetUUID } from '../handlerFuncs/handleGetUUID';
// import { handleGetUserSession } from '../handlerFuncs/handleGetUserSession';
// import { handleIncrementNumberOfConversions } from '../handlerFuncs/handleIncrementNumberOfConversions';
// import { handleIncrementNumberOfLogins } from '../handlerFuncs/handleIncrementNumberOfLogins';
import { handleResize } from "../handlerFuncs/handleResize";
// import { handleSaveImagesDict } from '../handlerFuncs/handleSaveImagesDict';
// import { handleSelectTopLevelComponents } from '../handlerFuncs/handleSelectTopLevelComponents';
// import { handleSetUserSession } from '../handlerFuncs/handleSetUserSession';
// import { handleUpdateDesignSystem } from '../handlerFuncs/handleUpdateDesignSystem';
// import { handleUpdateLastLoginDate } from '../handlerFuncs/handleUpdateLastLoginDate';
// import { handleUpdateSavedConfiguration } from '../handlerFuncs/handleUpdateSavedConfiguration';
// import { init } from '../handlerFuncs/init';
// import { getNodeArrBuf } from '../handlerFuncs/getNodeArrBuf';

export type PluginCoreHandlers = typeof pluginCoreHandlers;

export const pluginCoreHandlers = {
  resize: handleResize,
  // updateLastLoginDate: handleUpdateLastLoginDate,
  // incrementNumberOfLogins: handleIncrementNumberOfLogins,
  // incrementNumberOfConversions: handleIncrementNumberOfConversions,
  // getNumberOfConversions,
  // getUUID: handleGetUUID,
  getImageFromSelectedFrame,
  getFullDesignImageFromSelectedFrame,
  // updateDesignSystem: handleUpdateDesignSystem,
  // exportStylesToFigma: handleExportStylesToFigma,
  // setUserSession: handleSetUserSession,
  // getUserSession: handleGetUserSession,
  // init,
  getSelectedIds: handleGetSelectedIds,
  // getSavedConfiguration: handleGetSavedConfiguration,
  // updateSavedConfiguration: handleUpdateSavedConfiguration,
  // downloadTestCases: handleDownloadTestCases,
  // handleImagesDict: handleSaveImagesDict,
  focusNode: runFocusNode,
  // deselectAll,
  // getBlockingNodes: handleGetBlockingNodes,
  // selectTopLevelComponents: handleSelectTopLevelComponents,
  // generateAndDeserialize: handleGenerateAndDeserialize,
  // deserialize: handleDeserialize,
  // handleCreateComponentLibrary,
  // handleCreateComponentLibraryAndSampleInstances,
  // getJSONTrees,
  // getNodeSVGs,
  // getNodeArrBuf,
  // getImageArrBufs,
} satisfies Record<string, (...args: any[]) => any>;

// function decomponentisePage() {
//   //The below code is incredibly dangerous, and decomponentizes/deautolayouts the entire page. Run at your own risk
//   figma.currentPage.findAll((node) => {
//     if (node.type === 'COMPONENT_SET' && node.parent) {
//       figma.group(node.children, node.parent);
//       node.remove();
//       return false;
//     }
//     if (node.type === 'COMPONENT') {
//       const newNode = frameLikeToFrame(node);
//       node.remove();
//       node = newNode;
//     }
//     if (node.type === 'INSTANCE') {
//       node = node.detachInstance();
//     }
//     if (!('layoutMode' in node)) return false;
//     if (node.layoutMode === 'NONE') return false;
//     node.layoutMode = 'NONE';
//     return true;
//   });
// }
