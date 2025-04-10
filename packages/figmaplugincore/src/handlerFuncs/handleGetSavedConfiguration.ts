import { ConversionConfig, DEFAULT_CONFIG } from '@firejet-sync/shared/types';
import { updateSavedConfiguration } from './updateSavedConfiguration';
import { sendFrontend } from '../messaging';
import { getTailwindConfig } from './updateTailwindConfig';

export async function handleGetSavedConfiguration() {
  let savedConfiguration = (await figma.clientStorage.getAsync(
    'savedConfiguration',
  )) as ConversionConfig | undefined;

  savedConfiguration = { ...DEFAULT_CONFIG, ...(savedConfiguration ?? {}) };

  savedConfiguration.tailwindConfig = await getTailwindConfig();

  sendFrontend('savedConfiguration', savedConfiguration);
  return savedConfiguration;
}
