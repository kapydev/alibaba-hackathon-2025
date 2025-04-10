import { sendFrontend } from '../messaging';

export function updateIsPluginDevMode() {
  if (figma.editorType !== 'dev') return;
  if (figma.mode === 'codegen') return;
  sendFrontend('isPluginDevMode');
}
