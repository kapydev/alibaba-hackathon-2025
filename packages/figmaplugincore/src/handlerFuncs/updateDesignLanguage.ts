import { DesignLanguage } from '@firejet-sync/shared/types';

export async function updateDesignLanguage(designSystem: DesignLanguage) {
  return figma.clientStorage.setAsync('designSystem', designSystem);
}
