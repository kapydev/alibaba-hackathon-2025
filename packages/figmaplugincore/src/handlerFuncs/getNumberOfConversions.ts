import { sendFrontend } from '../messaging';

export async function getNumberOfConversions() {
  const numberOfConversions = await figma.clientStorage.getAsync(
    'numberOfConversions',
  );

  if (numberOfConversions === undefined || Number.isNaN(numberOfConversions)) {
    await figma.clientStorage.setAsync('numberOfConversions', 0);
    //TODO bring all the other derivatives (e.g. remaining conversions into this data sent)
    sendFrontend('numberOfConversions', { count: 0 });
  } else {
    sendFrontend('numberOfConversions', {
      count: numberOfConversions,
    });
  }
  // DO NOT REMOVE - this clears the clientstorage for testing
  // figma.clientStorage.deleteAsync('numberOfConversions');
}
