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
  const nodeAbsBox = node.absoluteBoundingBox;
  if (!nodeAbsBox) {
    console.error("Missing node abs box");
    return;
  }

  const lineColor = { r: 245 / 255, g: 74 / 255, b: 0 / 255 }; // rgb(245, 74, 0)
  const strokeWeight = 2;

  // Load font first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Create a text node for the comment
  const textNode = figma.createText();
  textNode.textAutoResize = 'HEIGHT';
  textNode.resize(200, textNode.height); // Set max width to 400
  textNode.characters = comment;
  textNode.fontSize = 14;
  textNode.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]; // Black text

  // Create a frame to contain the text with auto layout
  const container = figma.createFrame();
  container.name = "Annotation Container";
  container.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; // White background
  container.strokes = [{ type: "SOLID", color: lineColor }];
  container.strokeWeight = strokeWeight;
  container.cornerRadius = 8;

  // Set up auto layout
  container.layoutMode = "HORIZONTAL";
  container.paddingLeft = 8;
  container.paddingRight = 8;
  container.paddingTop = 8;
  container.paddingBottom = 8;
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";

  // Add text to container
  container.appendChild(textNode);

  // Add container to the page
  figma.currentPage.appendChild(container);

  // Position the container
  const offset = 20;
  container.x = nodeAbsBox.x + nodeAbsBox.width / 2 - container.width / 2;
  container.y = nodeAbsBox.y + nodeAbsBox.height + offset;

  // Create a line node and add it to the page
  const line = figma.createLine();
  figma.currentPage.appendChild(line);

  // Get the anchor points
  const nodeAnchor = getAnchor(node, "bottom");
  const containerAnchor = getAnchor(container, "top");

  // Configure the line between the node and the container
  configureLine(line, nodeAnchor, containerAnchor, lineColor, strokeWeight);

  // Notify that annotation was added
  // Check if there's a "Taffy Annotations" group in the current page
  let annotationGroup = figma.currentPage.findOne(
    (node) => node.type === "GROUP" && node.name === "Taffy Annotations"
  ) as GroupNode;

  // If the group doesn't exist, create it
  if (!annotationGroup) {
    annotationGroup = figma.group([container, line], figma.currentPage);
    annotationGroup.name = "Taffy Annotations";
  } else {
    // If the group exists, add the container and line to it
    annotationGroup.appendChild(container);
    annotationGroup.appendChild(line);
  }
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
  color: RGB,
  strokeWeight: number
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
  line.strokeWeight = strokeWeight;
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
