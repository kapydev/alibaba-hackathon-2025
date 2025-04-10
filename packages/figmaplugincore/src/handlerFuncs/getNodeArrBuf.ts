import { tryGet } from '@firejet-sync/shared/errors';

export async function getNodeArrBuf(nodeId: string) {
  const node = await tryGet(() => figma.getNodeByIdAsync(nodeId), null);
  if (!node) return undefined;
  if (!('exportAsync' in node)) return undefined;
  const imgArr = await tryGet(
    () =>
      node.exportAsync({
        format: 'PNG',
      }),
    null,
  );
  if (!imgArr) return undefined;
  return imgArr;
}
