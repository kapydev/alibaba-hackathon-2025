import { sendFrontend } from '../messaging';

export function updateSelectedLayers() {
  if (figma.currentPage.selection.length === 0) {
    sendFrontend('updateSelectedLayers', []);
  } else {
    if (figma.editorType === 'dev') {
      // Developer Mode
      figma.clientStorage
        .getAsync('uniqueUserID')
        .then((data) => sendFrontend('trackDevFrameSelected', data));
    }
    const selectedNodes = figma.currentPage.selection.map((node) => {
      return {
        name: node.name,
        id: node.id,
        page: figma.root.name,
      };
    });
    sendFrontend('updateSelectedLayers', selectedNodes);
  }
}
