export function getDesignQualityStats(selection: readonly SceneNode[]) {
  let numAbsolute = 0;
  let numAutoLayout = 0;

  const queue: SceneNode[] = [...selection];
  let curNodeCount = 0;

  const MAX_NODES_CHECKED = 100;

  while (queue.length > 0) {
    const curNode = queue.shift();

    if (!curNode) break;
    if (curNodeCount > MAX_NODES_CHECKED) break;

    if ('layoutMode' in curNode) {
      if (curNode.layoutMode === 'NONE') {
        numAbsolute += 1;
      } else {
        numAutoLayout += 1;
      }
    }

    if ('children' in curNode) {
      queue.push(...curNode.children);
    }

    curNodeCount += 1;
  }

  return {
    numAbsolute,
    numAutoLayout,
    ratioAbsolute: numAbsolute / (numAbsolute + numAutoLayout),
  };
}
