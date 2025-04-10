import { sendFrontend } from '../messaging';
import { getDesignQualityStats } from './getDesignQualityStats';

export function updateNumAbsolute() {
  const designQuality = getDesignQualityStats(figma.currentPage.selection);

  sendFrontend('updateDesignQuality', designQuality);
}
