import { ConversionConfig } from '@firejet-sync/shared/types';
import { updateSavedConfiguration } from './updateSavedConfiguration';

export function handleUpdateSavedConfiguration(data: ConversionConfig) {
  updateSavedConfiguration(data);
}
