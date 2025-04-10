import { getFigmaNodeById } from "../helpers/getFigmaNodeById";

let myIdentifierRect: RectangleNode | undefined;

export function removeIdentifierRect() {
  if (myIdentifierRect) {
    try {
      myIdentifierRect.remove();
    } catch {
      //We just need to try to remove the identifier rectangle
    }
    myIdentifierRect = undefined;
  }
}
//TODO: Focus node in such a way that the FireJet viewport is not blocking it
export async function runFocusNode(data: {
  nodeId: string;
  outline?: boolean;
  zoomIntoView?: boolean;
  select?: boolean;
}) {
  const focusResult = focusNode(data);
  if (focusResult !== undefined) {
    throw new Error(`Unabled to focus node ${data.nodeId}`);
  }
}

/** Returns false if node cannot be focused, true otherwise */
export async function focusNode(data: {
  nodeId: string;
  outline?: boolean;
  zoomIntoView?: boolean;
  select?: boolean;
}): Promise<boolean> {
  removeIdentifierRect();

  const relevantNode = getFigmaNodeById(data.nodeId);

  if (!relevantNode) return false;
  if (!("absoluteRenderBounds" in relevantNode)) return false;

  if (data.zoomIntoView) {
    figma.viewport.scrollAndZoomIntoView([relevantNode]);
  }
  if (data.outline) {
    createIdentifierBox([relevantNode]);
  }
  if (data.select) {
    figma.currentPage.selection = [relevantNode];
  }
  // figma.currentPage.selection = [relevantNode as SceneNode];

  return true;
}

function createIdentifierBox(nodesToIdentify: Array<LayoutMixin>) {
  const nonInvisibleNodes = nodesToIdentify.filter(
    (node) => node.absoluteRenderBounds
  ) as Array<
    LayoutMixin & {
      absoluteRenderBounds: Rect;
    }
  >;

  const topLeftX = Math.min(
    ...nonInvisibleNodes.map((node) => node.absoluteRenderBounds.x)
  );
  const topLeftY = Math.min(
    ...nonInvisibleNodes.map((node) => node.absoluteRenderBounds.y)
  );
  const bottomRightX = Math.max(
    ...nonInvisibleNodes.map(
      (node) => node.absoluteRenderBounds.x + node.absoluteRenderBounds.width
    )
  );
  const bottomRightY = Math.max(
    ...nonInvisibleNodes.map(
      (node) => node.absoluteRenderBounds.y + node.absoluteRenderBounds.height
    )
  );
  myIdentifierRect = figma.createRectangle();
  myIdentifierRect.x = topLeftX;
  myIdentifierRect.y = topLeftY;
  const width = bottomRightX - topLeftX;
  const height = bottomRightY - topLeftY;
  myIdentifierRect.resize(width, height);
  myIdentifierRect.fills = [];
  myIdentifierRect.strokes = [
    {
      type: "SOLID",
      visible: true,
      opacity: 1,
      blendMode: "NORMAL",
      color: { r: 1, g: 0, b: 0 },
    },
  ];

  myIdentifierRect.strokeWeight = 3 / figma.viewport.zoom;
}
