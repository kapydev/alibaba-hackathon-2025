import { tryGet } from '@firejet-sync/shared/errors';
const logger = console;

export async function getImageArrBufs(imageHashes: string[]) {
  const hashToLink: Record<string, Uint8Array> = {};
  await Promise.all(
    imageHashes.map(async (imageHash) => {
      const image = tryGet(() => figma.getImageByHash(imageHash), undefined);
      if (!image) return undefined;
      const imgArr = await tryGet(
        async () => await image.getBytesAsync(),
        undefined,
      );
      if (!imgArr) return;
      hashToLink[imageHash] = imgArr;
    }),
  );
  return hashToLink;
}
