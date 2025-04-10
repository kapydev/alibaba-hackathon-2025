import { sendFrontend } from '../messaging';

export async function handleUpdateLastLoginDate(lastDateISOstring: string) {
  const lastLogin = await figma.clientStorage.getAsync('lastLogin');
  const newLogin = Date.parse(lastDateISOstring);
  sendFrontend('lastLogin', lastLogin);
  figma.clientStorage.setAsync('lastLogin', newLogin).catch((err) => {});
}
