import { sendFrontend } from '../messaging';
import { getDesignSystem } from './getDesignSystem';

export async function handleUpdateUIStyleManager() {
  const designSystem = await getDesignSystem();
  sendFrontend('designSystem', designSystem);
}
