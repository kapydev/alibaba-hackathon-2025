import { traverse } from "@shared";
import { sendFrontend } from "../messaging";

export async function updateSelectedLayers() {
  console.log(figma.currentPage.selection[0]);
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
        };
      })
    );
    sendFrontend("updateSelectedLayers", selectedNodes);
    return selectedNodes;
  }
}

export async function getSelectedLayersFull() {
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
          nodeString: await getNodeStr(node),
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

async function getNodeStr(node: SceneNode): Promise<string> {
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
    "counterAxisAlignItems",
    "primaryAxisAlignItems",
    "layoutWrap",
    "layoutMode",
    "layoutGrow",
    "layoutAlign",
    "lineTypes",
    "lineIndentations",
    "styleOverrideTable",
    "characterStyleOverrides",
    "layoutSizingHorizontal",
    "layoutSizingVertical",
    "rotation",
    "primaryAxisSizingMode",
    "itemSpacing",
    "layoutVersion",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "cornerRadius",
    "strokeJoin",
    "strokeCap",
  ]);
  const TYPE_STYLE_USELESS_KEYS = [
    "textAutoResize",
    "textAlignHorizontal",
    "textAlignVertical",
    "letterSpacing",
    "lineHeightPx",
    "lineHeightPercent",
    "lineHeightPercentFontSize",
    "lineHeightUnit",
  ];
  traverse(root, (node) => {
    Object.entries(node).forEach(([key, val]) => {
      if (USELESS_KEYS.has(key)) {
        delete node[key];
        return;
      }
      if (key === "style") {
        for (const uselessTypeStyleKey of TYPE_STYLE_USELESS_KEYS) {
          delete node.style[uselessTypeStyleKey];
        }
      }
      // Remove empty fills, strokes, effects arrays
      if (
        (key === "fills" || key === "strokes" || key === "effects") &&
        Array.isArray(val) &&
        val.length === 0
      ) {
        delete node[key];

        // If strokes is empty, also remove strokeWeight
        if (key === "strokes") {
          delete node["strokeWeight"];
        }
        return;
      }

      // Clean up blendMode and imageRef from fills, strokes, effects arrays
      if (
        (key === "fills" || key === "strokes" || key === "effects") &&
        Array.isArray(val)
      ) {
        val.forEach((item) => {
          if (item) {
            delete item.blendMode;
            delete item.imageRef;
            // Convert color objects to rgba string format
            if (
              item.color &&
              typeof item.color === "object" &&
              "r" in item.color &&
              "g" in item.color &&
              "b" in item.color &&
              "a" in item.color
            ) {
              item.color = roundNumbers(item.color);
              item.color = `rgba(${item.color.r},${item.color.g},${item.color.b},${item.color.a})`;
            }
          }
        });
      }

      // Convert absoluteBoundingBox to a compact string format
      if (
        key === "absoluteBoundingBox" &&
        val &&
        typeof val === "object" &&
        "x" in val &&
        "y" in val &&
        "width" in val &&
        "height" in val
      ) {
        const roundedVal = roundNumbers(val);
        node[
          key
        ] = `x=${roundedVal.x},y=${roundedVal.y},w=${roundedVal.width},h=${roundedVal.height}`;
        return;
      }
    });
  });

  const roundedRoot = roundNumbers(root);
  const stringifiedRoot = stringifyNode(roundedRoot);

  console.log({ roundedRoot, stringifiedRoot });
  return stringifiedRoot;
}

function stringifyNode(node: any): string {
  // Create a copy of the node without children for stringification
  const { children, ...nodeWithoutChildren } = node;

  // Stringify the node without children, removing the outer braces
  const nodeString = JSON.stringify(nodeWithoutChildren).slice(1, -1); // Remove the { and } characters

  // Start with the node details on one line
  let result = `{${nodeString}`;

  // Add children with proper indentation if they exist
  if (children && children.length > 0) {
    result += `, "children": [\n`;

    // Add each child with additional 2 spaces of indentation
    const childrenStrings = children?.map((child: any) => {
      // Recursively stringify each child with proper indentation
      return stringifyNode(child)
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
    });

    result += childrenStrings.join(",\n");
    result += "\n]";
  }

  result += "}";
  return result;
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
