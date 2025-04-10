import { FeatureFlags, flagChances } from '@firejet-sync/shared/constants';
import { sendFrontend } from '../messaging';

export async function updateFeatureFlags() {
  //TODO: Replace this function by hosting UI on seperate origin so that we can directly use posthog feature flags
  const curFlags = await figma.clientStorage.getAsync('featureFlags');
  const updatedFlags = generateFeatureFlags(curFlags ?? {});
  await figma.clientStorage.setAsync('featureFlags', updatedFlags);
  sendFrontend('featureFlags', updatedFlags);
}

function generateFeatureFlags(
  currentFlags: Partial<FeatureFlags> = {},
): FeatureFlags {
  const resultFlags: Partial<FeatureFlags> = { ...currentFlags };

  for (const flag in flagChances) {
    if (!(flag in currentFlags)) {
      const flagOptions = (flagChances as any)[flag];
      let cumulativeProbability = 0;
      const rand = Math.random();
      for (const value in flagOptions) {
        cumulativeProbability += flagOptions[value];
        if (rand <= cumulativeProbability) {
          (resultFlags as any)[flag] = value as keyof typeof flagOptions;
          break;
        }
      }
    }
  }

  // Type assertion to assert that the generated flags match the FeatureFlags type
  return resultFlags as FeatureFlags;
}
