import { booleanFilter } from '@firejet-sync/shared/helpers';

export async function getNodeSVGs(nodeIds: string[]) {
  const idToSVG: Record<string, string> = {};
  await Promise.all(
    nodeIds.map(async (nodeId) => {
      try {
        const node = await figma.getNodeByIdAsync(nodeId);
        if (!node) return undefined;
        if (!('exportAsync' in node)) return undefined;
        const svgStr = await node.exportAsync({
          format: 'SVG_STRING',
        });
        idToSVG[nodeId] = svgStr;
      } catch {}
    }),
  );
  return idToSVG;
}
