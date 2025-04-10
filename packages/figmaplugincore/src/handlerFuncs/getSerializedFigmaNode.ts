import { serializeFigmaNodes } from '@firejet/firejet-js';

import { sendFrontend } from '../messaging';

export async function getSerializedFigmaNode() {
  const serializedNodes = {
    engineOne: null,
    engineTwo: await serializeFigmaNodes(figma.currentPage.selection),
  };

  sendFrontend('newRawTree', serializedNodes);

  return serializedNodes;
}
