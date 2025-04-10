import { sendFrontend } from '../messaging';

export async function handleGetUserSession() {
  figma.clientStorage
    .getAsync('userSession')
    .then((session) => {
      sendFrontend('userSession', session);
    })
    .catch((err) => {});
}
