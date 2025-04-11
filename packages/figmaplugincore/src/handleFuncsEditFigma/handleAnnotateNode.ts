/**
 * Handles annotating a Figma node with a comment
 * @param nodeId The ID of the node to annotate
 * @param comment The comment text to add
 * @returns Promise that resolves when the annotation is complete
 */
export async function handleAnnotateNode(data: {
  nodeId: string;
  comment: string;
}): Promise<void> {
  const { nodeId, comment } = data;

  // Get the node by ID
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    return;
  }

  // Get the node's position and dimensions
  if (!("x" in node && "y" in node && "width" in node && "height" in node)) {
    console.error(
      `Node ${nodeId} doesn't have position or dimension properties`
    );
    return;
  }

  // Find the topmost parent to ensure annotation is placed outside the parent tree
  let topParent = node;
  while (
    topParent.parent &&
    topParent.parent.type !== "PAGE" &&
    topParent.parent.type !== "DOCUMENT"
  ) {
    topParent = topParent.parent as SceneNode;
  }

  const lineColor = { r: 245 / 255, g: 74 / 255, b: 0 / 255 }; // rgb(245, 74, 0)
  // Create a text node for the comment and add it to the page first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const textNode = figma.createText();
  figma.currentPage.appendChild(textNode);
  textNode.characters = comment;
  textNode.fontSize = 14;
  textNode.fills = [
    {
      type: "SOLID",
      color: lineColor,
    },
  ];

  // Create a line node and add it to the page first
  const line = figma.createLine();
  figma.currentPage.appendChild(line);

  const offset = 20;

  // Get the anchor point on the node
  const nodeAnchor = getAnchor(node, "bottom");

  textNode.x = node.x + node.width / 2 - textNode.width / 2;
  textNode.y = topParent.y + topParent.height + offset;

  // Get the text node anchor point
  const textAnchor = getAnchor(textNode, "top");

  // Configure the line between the node and the text
  configureLine(line, nodeAnchor, textAnchor, lineColor);

  // Group the text and line together after positioning
  // const group = figma.group([textNode, line], figma.currentPage);
  // group.name = `Annotation for ${node.name}`;

  // Notify that annotation was added
}

/**
 * Configures a line between two points with the specified color
 * @param line The line node to configure
 * @param start The starting point coordinates {x, y}
 * @param end The ending point coordinates {x, y}
 * @param color The color of the line
 */
function configureLine(
  line: LineNode,
  start: { x: number; y: number },
  end: { x: number; y: number },
  color: RGB
): void {
  console.log({ start, end });

  // Set the starting position
  line.x = start.x;
  line.y = start.y;

  // Calculate the length and angle
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = -Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // Set the rotation and length
  line.rotation = angle;
  line.resize(length, 0);

  // Style the line
  line.strokeWeight = 1;
  line.strokes = [{ type: "SOLID", color: color }];
}

/**
 * Gets the anchor point coordinates for a node based on the specified position
 * @param node The node to get anchor coordinates for
 * @param position The position of the anchor (top, bottom, left, right)
 * @returns An object with x and y coordinates of the anchor point
 */
function getAnchor(
  node: SceneNode,
  position: "top" | "bottom" | "left" | "right"
): { x: number; y: number } {
  // Get the absolute bounding box of the node
  const bbox = node.absoluteBoundingBox;

  if (!bbox) {
    // Fallback if absoluteBoundingBox is not available
    console.warn("absoluteBoundingBox not available for node:", node.name);
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
    };
  }

  switch (position) {
    case "top":
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y,
      };
    case "bottom":
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height,
      };
    case "left":
      return {
        x: bbox.x,
        y: bbox.y + bbox.height / 2,
      };
    case "right":
      return {
        x: bbox.x + bbox.width,
        y: bbox.y + bbox.height / 2,
      };
    default:
      // Default to center if invalid position is provided
      return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
      };
  }
}
