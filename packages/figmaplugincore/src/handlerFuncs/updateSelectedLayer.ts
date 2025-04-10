import { sendFrontend } from "../messaging";

export async function updateSelectedLayers() {
  if (figma.currentPage.selection.length === 0) {
    sendFrontend("updateSelectedLayers", []);
  } else {
    const selectedNodes = await Promise.all(
      figma.currentPage.selection.map(async (node) => {
        return {
          name: node.name,
          id: node.id,
          page: figma.root.name,
          json: await node.exportAsync({
            format: "JSON_REST_V1",
          }),
          image: await node.exportAsync({
            format: "PNG",
          }),
        };
      })
    );
    sendFrontend("updateSelectedLayers", selectedNodes);
  }
}
