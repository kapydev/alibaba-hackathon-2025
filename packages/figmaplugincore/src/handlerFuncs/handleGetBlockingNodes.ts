import { getBlockingNodes } from '@firejet-sync/figma-plugin/helpers';

export function handleGetBlockingNodes() {
  const curSelection = figma.currentPage.selection;
  const blockingNodes = curSelection
    .flatMap(getBlockingNodes)
    .map((node) => ({ id: node.id, name: node.name }));
  return {
    blockingNodes,
    curSelection: curSelection.map((node) => ({
      id: node.id,
      name: node.name,
    })),
  };
}
