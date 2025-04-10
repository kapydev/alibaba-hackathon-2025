import { sendFrontend } from "../messaging";

export function updateSelectedLayers() {
  if (figma.currentPage.selection.length === 0) {
    sendFrontend("updateSelectedLayers", []);
  } else {
    const selectedNodes = figma.currentPage.selection.map((node) => {
      return {
        name: node.name,
        id: node.id,
        page: figma.root.name,
      };
    });
    sendFrontend("updateSelectedLayers", selectedNodes);
  }
}
