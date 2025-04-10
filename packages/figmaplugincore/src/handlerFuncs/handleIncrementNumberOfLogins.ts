import { sendFrontend } from '../messaging';

export async function handleIncrementNumberOfLogins() {
  let numberOfLogins = await figma.clientStorage.getAsync('numberOfLogins');
  if (numberOfLogins === undefined || Number.isNaN(numberOfLogins)) {
    numberOfLogins = 1;
  }
  const incrementedNumberOfLogins = numberOfLogins + 1;
  sendFrontend('numberOfLogins', numberOfLogins);
  figma.clientStorage
    .setAsync('numberOfLogins', incrementedNumberOfLogins)
    .catch((err) => {});
}
