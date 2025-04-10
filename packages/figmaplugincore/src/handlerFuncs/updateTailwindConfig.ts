import { TailwindConfig } from '@firejet-sync/shared/types';

export async function updateTailwindConfig(tailwindConfig: TailwindConfig) {
  return figma.clientStorage.setAsync('tailwindConfig', tailwindConfig);
}

export async function getTailwindConfig(): Promise<TailwindConfig | undefined> {
  return (await figma.clientStorage.getAsync('tailwindConfig')) ?? undefined;
}
