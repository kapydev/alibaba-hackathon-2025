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

  const pageBackground = figma.currentPage.backgrounds[0];
  const isDarkBackground =
    pageBackground &&
    pageBackground.type === "SOLID" &&
    pageBackground.color &&
    (pageBackground.color.r + pageBackground.color.g + pageBackground.color.b) /
      3 <
      0.5;

  const lineColor = isDarkBackground
    ? { r: 1, g: 1, b: 1 } // White for dark backgrounds
    : { r: 0, g: 0, b: 0 }; // Black for light backgrounds
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

  // Get the current page background color to determine line color

  // Calculate available space in each direction
  const pageWidth = figma.viewport.bounds.width;
  const pageHeight = figma.viewport.bounds.height;

  const spaceTop = topParent.y;
  const spaceRight = pageWidth - (topParent.x + topParent.width);
  const spaceBottom = pageHeight - (topParent.y + topParent.height);
  const spaceLeft = topParent.x;

  // Determine the best position for the annotation
  const offset = 20; // Offset from the node
  let position: "top" | "right" | "bottom" | "left";
  const spaces = [
    { dir: "top", space: spaceTop },
    { dir: "right", space: spaceRight },
    { dir: "bottom", space: spaceBottom },
    { dir: "left", space: spaceLeft },
  ];

  // Sort by available space and choose the direction with most space
  spaces.sort((a, b) => b.space - a.space);
  position = spaces[0].dir as "top" | "right" | "bottom" | "left";

  // Get the anchor point on the node
  const nodeAnchor = getAnchor(node, position);
  console.log({ nodeAnchor });

  // Position the text node based on the chosen direction
  switch (position) {
    case "top":
      textNode.x = node.x + node.width / 2 - textNode.width / 2;
      textNode.y = topParent.y - offset - textNode.height;
      break;

    case "right":
      textNode.x = topParent.x + topParent.width + offset;
      textNode.y = node.y + node.height / 2 - textNode.height / 2;
      break;

    case "bottom":
      textNode.x = node.x + node.width / 2 - textNode.width / 2;
      textNode.y = topParent.y + topParent.height + offset;
      break;

    case "left":
      textNode.x = topParent.x - offset - textNode.width;
      textNode.y = node.y + node.height / 2 - textNode.height / 2;
      break;
  }

  // Determine the opposite position for the text node anchor
  const oppositePosition: "top" | "right" | "bottom" | "left" =
    position === "top"
      ? "bottom"
      : position === "right"
      ? "left"
      : position === "bottom"
      ? "top"
      : "right";

  // Get the text node anchor point
  const textAnchor = getAnchor(textNode, oppositePosition);

  // Configure the line between the node and the text
  configureLine(line, nodeAnchor, textAnchor, lineColor);

  // Group the text and line together after positioning
  // const group = figma.group([textNode, line], figma.currentPage);
  // group.name = `Annotation for ${node.name}`;

  // Notify that annotation was added
  figma.notify(`Added annotation to ${node.name}`);
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
