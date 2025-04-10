import { getNumberOfConversions } from './getNumberOfConversions';
import { handleOpenCommand } from './handleOpenCommand';
import { handleUpdateUIStyleManager } from './handleUpdateUIStyleManager';
import { setRelaunchData } from './setRelaunchData';
import { updateFeatureFlags } from './updateFeatureFlags';
import { updateIsPluginDevMode } from './updateIsPluginDevMode';
import { updateNumAbsolute } from './updateNumAbsolute';
import { updateSelectedLayers } from './updateSelectedLayer';

export async function init() {
  updateSelectedLayers();
  handleUpdateUIStyleManager();
  setRelaunchData();
  handleOpenCommand();
  updateNumAbsolute();
  updateIsPluginDevMode();
  getNumberOfConversions();
  updateFeatureFlags();
}
