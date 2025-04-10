import { ConversionConfig } from '@firejet-sync/shared/types';

export async function updateSavedConfiguration(
  savedConfiguration: ConversionConfig,
) {
  await figma.clientStorage.setAsync('savedConfiguration', savedConfiguration);
  return;
}
