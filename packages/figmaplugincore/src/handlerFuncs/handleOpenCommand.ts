import { sendFrontend } from '../messaging';

export function handleOpenCommand() {
  if (figma.command === 'convert') {
    sendFrontend('startConversion');
  }
}
