import { sendFrontend } from '../messaging';

export async function handleIncrementNumberOfConversions() {
  let numberOfConversions = await figma.clientStorage.getAsync(
    'numberOfConversions',
  );

  numberOfConversions++;
  sendFrontend('numberOfConversions', {
    count: numberOfConversions,
  });
  figma.clientStorage.setAsync('numberOfConversions', numberOfConversions);
}
