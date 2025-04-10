import { DesignLanguage, TailwindConfig } from '@firejet-sync/shared/types';
import { handleUpdateUIStyleManager } from './handleUpdateUIStyleManager';
import { updateDesignLanguage } from './updateDesignLanguage';
import { updateTailwindConfig } from './updateTailwindConfig';
import { handleGetSavedConfiguration } from './handleGetSavedConfiguration';

export async function handleUpdateDesignSystem(data: {
  designSystem: DesignLanguage;
  tailwindConfig: TailwindConfig;
}) {
  await updateDesignLanguage(data.designSystem);
  await updateTailwindConfig(data.tailwindConfig);
  await handleUpdateUIStyleManager();
  //Update the frontend
  await handleGetSavedConfiguration();
}
