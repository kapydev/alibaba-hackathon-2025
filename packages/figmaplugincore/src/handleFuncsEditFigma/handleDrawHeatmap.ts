/**
 * Handles drawing a heatmap visualization around a Figma node
 * @param nodeId The ID of the node to center the heatmap on
 * @param radius The radius of the inner circle
 * @param spreadRadius The additional radius for the outer circles
 * @returns Promise that resolves when the heatmap is drawn
 */
export async function handleDrawHeatmap(data: {
  nodeId: string;
  radius: number;
  spreadRadius: number;
}): Promise<void> {
  const { nodeId, radius, spreadRadius } = data;

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

  // Calculate the center of the node
  const centerX = nodeAbsBox.x + nodeAbsBox.width / 2;
  const centerY = nodeAbsBox.y + nodeAbsBox.height / 2;

  // Create the three circles for the heatmap
  const redCircle = figma.createEllipse();
  const yellowCircle = figma.createEllipse();
  const greenCircle = figma.createEllipse();

  // Set names for the circles
  redCircle.name = "Heatmap - Hot";
  yellowCircle.name = "Heatmap - Medium";
  greenCircle.name = "Heatmap - Cool";

  // Set the sizes of the circles
  const redRadius = radius;
  const yellowRadius = radius + 0.5 * spreadRadius;
  const greenRadius = radius + spreadRadius;

  // Resize the circles
  redCircle.resize(redRadius * 2, redRadius * 2);
  yellowCircle.resize(yellowRadius * 2, yellowRadius * 2);
  greenCircle.resize(greenRadius * 2, greenRadius * 2);

  // Position the circles at the center of the node
  redCircle.x = centerX - redRadius;
  redCircle.y = centerY - redRadius;
  yellowCircle.x = centerX - yellowRadius;
  yellowCircle.y = centerY - yellowRadius;
  greenCircle.x = centerX - greenRadius;
  greenCircle.y = centerY - greenRadius;

  // Set the colors and opacity
  redCircle.fills = [
    {
      type: "SOLID",
      color: { r: 1, g: 0, b: 0 },
      opacity: 0.5,
    },
  ];

  yellowCircle.fills = [
    {
      type: "SOLID",
      color: { r: 1, g: 1, b: 0 },
      opacity: 0.5,
    },
  ];

  greenCircle.fills = [
    {
      type: "SOLID",
      color: { r: 0, g: 1, b: 0 },
      opacity: 0.5,
    },
  ];

  // Add the circles to the page in the correct order (green at the bottom, red at the top)
  figma.currentPage.appendChild(greenCircle);
  figma.currentPage.appendChild(yellowCircle);
  figma.currentPage.appendChild(redCircle);

  // Check if there's a "Taffy Annotations" group in the current page
  let annotationGroup = figma.currentPage.findOne(
    (node) => node.type === "GROUP" && node.name === "Taffy Annotations"
  ) as GroupNode;

  // If the group doesn't exist, create it
  if (!annotationGroup) {
    annotationGroup = figma.group(
      [greenCircle, yellowCircle, redCircle],
      figma.currentPage
    );
    annotationGroup.name = "Taffy Annotations";
  } else {
    // If the group exists, add the circles to it
    annotationGroup.appendChild(greenCircle);
    annotationGroup.appendChild(yellowCircle);
    annotationGroup.appendChild(redCircle);
  }
}
