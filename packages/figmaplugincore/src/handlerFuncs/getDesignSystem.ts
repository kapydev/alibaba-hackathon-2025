import { DesignLanguage } from '@firejet-sync/shared/types';
import { updateDesignLanguage } from './updateDesignLanguage';

const logger = console;

export async function getDesignSystem() {
  let designSystem = (await figma.clientStorage.getAsync('designSystem')) as
    | DesignLanguage
    | undefined;
  if (!designSystem) {
    designSystem = { tokens: {} };
    await updateDesignLanguage({ tokens: {} });
  }
  logger.log('DESIGN SYSTEM: ', designSystem);
  return designSystem;
}
