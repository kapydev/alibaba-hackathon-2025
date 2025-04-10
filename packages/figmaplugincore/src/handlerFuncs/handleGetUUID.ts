import { generateUUID } from '@firejet-sync/shared/helpers';
import { sendFrontend } from '../messaging';

export async function handleGetUUID() {
  const uuid = await figma.clientStorage
    .getAsync('uniqueUserID')
    .then((uuid) => {
      if (!Boolean(uuid)) {
        uuid = generateUUID();
        figma.clientStorage.setAsync('uniqueUserID', uuid);
      }
      sendFrontend('uniqueUserID', uuid);

      return uuid as string;
    })
    .catch((err) => {
      return undefined;
    });

  return uuid;
}
