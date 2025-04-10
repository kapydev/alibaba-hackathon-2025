/**
 * Handles changing the color of a Figma node
 * @param nodeId The ID of the node to change color
 * @param r Red component (0-1)
 * @param g Green component (0-1)
 * @param b Blue component (0-1)
 * @param a Alpha component (0-1)
 * @returns Promise that resolves when the color change is complete
 */
export async function handleChangeTextColor(data: {
  nodeId: string;
  r: string;
  g: string;
  b: string;
  a: string;
}): Promise<void> {
  const { nodeId, r, g, b, a } = data;
  const rValue = parseFloat(r);
  const gValue = parseFloat(g);
  const bValue = parseFloat(b);
  const aValue = parseFloat(a);
  // Get the node by ID
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    return;
  }

  // Apply color based on node type
  if ("fills" in node && Array.isArray(node.fills)) {
    console.log("RUNNING CHANGE COLOR");
    // For shapes, frames, etc. that have fills
    node.fills = [
      {
        type: "SOLID",
        color: { r: rValue, g: gValue, b: bValue },
        opacity: aValue,
      },
    ];
  }
}
