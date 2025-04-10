import { traverse } from "@shared";
import { sendFrontend } from "../messaging";

export async function updateSelectedLayers() {
  if (figma.currentPage.selection.length === 0) {
    sendFrontend("updateSelectedLayers", []);
    return [];
  } else {
    const selectedNodes = await Promise.all(
      figma.currentPage.selection.map(async (node) => {
        return {
          name: node.name,
          id: node.id,
          page: figma.root.name,
          json: await getSimplifiedJson(node),
          image: await node.exportAsync({
            format: "PNG",
          }),
        };
      })
    );
    sendFrontend("updateSelectedLayers", selectedNodes);
    return selectedNodes;
  }
}

async function getSimplifiedJson(node: SceneNode): Promise<any> {
  const result = (await node.exportAsync({
    format: "JSON_REST_V1",
  })) as any;
  const root = result.document;
  const USELESS_KEYS = new Set([
    "absoluteRenderBounds",
    "background",
    "backgroundColor",
    "blendMode",
    "clipsContent",
    "cornerSmoothing",
    "exportSettings",
    "interactions",
    "scrollBehavior",
    "transitionDuration",
    "transitionEasing",
    "transitionNodeID",
    "fillOverrideTable",
    "constraints",
    "strokeAlign",
    "arcData",
  ]);
  traverse(root, (node) => {
    Object.entries(node).forEach(([key, val]) => {
      if (USELESS_KEYS.has(key)) {
        delete node[key];
        return;
      }
    });
  });

  const roundedRoot = roundNumbers(root);

  console.log(roundedRoot);
  return roundedRoot;
}

function roundNumbers(obj: any): any {
  if (typeof obj === "number") {
    return Number(obj.toFixed(3));
  }

  if (Array.isArray(obj)) {
    return obj.map(roundNumbers);
  }

  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[key] = roundNumbers(obj[key]);
    }
    return result;
  }

  return obj;
}
